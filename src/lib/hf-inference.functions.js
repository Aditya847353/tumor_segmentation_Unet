
const SPACE = "https://adityaanand0-brain-tumor-demo.hf.space";
async function uploadOne(file) {
  const fd = new FormData();
  fd.append("files", file, file.name);
  const res = await fetch(`${SPACE}/gradio_api/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) {
    throw new Error(`Gradio upload failed (${res.status}): ${await res.text().catch(() => "")}`);
  }
  const paths = await res.json();
  if (!Array.isArray(paths) || !paths[0]) {
    throw new Error("Gradio upload returned no path");
  }
  return {
    path: paths[0],
    orig_name: file.name,
    mime_type: file.type || "application/octet-stream",
    size: file.size,
    meta: { _type: "gradio.FileData" },
  };
}
async function readSseUntilComplete(res) {
  if (!res.body) throw new Error("Empty SSE body from Gradio");
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEvent = "message";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buffer.indexOf("\n\n")) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx + 2);
      const lines = raw.split("\n");
      let dataLine = "";
      currentEvent = "message";
      for (const line of lines) {
        if (line.startsWith("event:")) currentEvent = line.slice(6).trim();
        else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
      }
      if (!dataLine) continue;
      if (currentEvent === "error") {
        throw new Error(`Gradio error event: ${dataLine}`);
      }
      if (currentEvent === "complete") {
        try {
          const parsed = JSON.parse(dataLine);
          if (Array.isArray(parsed)) return parsed;
          throw new Error("Unexpected Gradio complete payload");
        } catch (e) {
          throw new Error(`Failed to parse Gradio complete: ${String(e)}`);
        }
      }
      // generating / heartbeat / etc — ignore
    }
  }
  throw new Error("Gradio stream ended before completion");
}
function asFileUrl(out) {
  if (out && typeof out === "object") {
    const o = out;
    if (o.url) return o.url;
    if (o.path) return `${SPACE}/gradio_api/file=${o.path}`;
  }
  throw new Error("Expected Gradio file output, got: " + JSON.stringify(out));
}
export async function runHfInference(data) {
  const t0 = Date.now();

  const channels = ["FLAIR", "T1", "T1CE", "T2"];

  const files = {};

  for (const c of channels) {
    const f = data.get(c);

    if (!(f instanceof File)) {
      throw new Error(`Missing file for channel ${c}`);
    }

    files[c] = f;
  }

  // Upload all four MRI volumes in parallel
  const [flair, t1, t1ce, t2] = await Promise.all([
    uploadOne(files.FLAIR),
    uploadOne(files.T1),
    uploadOne(files.T1CE),
    uploadOne(files.T2),
  ]);

  // Start prediction
  const callRes = await fetch(`${SPACE}/gradio_api/call/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      data: [flair, t1, t1ce, t2],
    }),
  });

  if (!callRes.ok) {
    throw new Error(
      `Gradio call failed (${callRes.status}): ${await callRes.text().catch(() => "")}`
    );
  }

  const { event_id } = await callRes.json();

  if (!event_id) {
    throw new Error("Gradio did not return an event_id");
  }

  // Wait for prediction to complete
  const streamRes = await fetch(
    `${SPACE}/gradio_api/call/predict/${event_id}`,
    {
      headers: {
        Accept: "text/event-stream",
      },
    }
  );

  if (!streamRes.ok) {
    throw new Error(`Gradio stream failed (${streamRes.status})`);
  }

  const output = await readSseUntilComplete(streamRes);

  return {
    flairUrl: asFileUrl(output[0]),
    t1Url: asFileUrl(output[1]),
    t1ceUrl: asFileUrl(output[2]),
    t2Url: asFileUrl(output[3]),
    maskUrl: asFileUrl(output[4]),
    overlayUrl: asFileUrl(output[5]),
    voxelCountsHtml: String(output[6]),
    statusText: String(output[7]),
    summaryMd: String(output[8]),
    confidence: Number(output[9]),
    confidenceHtml: String(output[10] ?? ""),
    inferenceMs: Date.now() - t0,
  };
}