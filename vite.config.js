// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const routeTreePath = fileURLToPath(new URL("./src/routeTree.gen.js", import.meta.url));

function removeTypeScriptRouteFooter(source) {
  const footerStart = source.indexOf("\nimport type ");
  return footerStart === -1 ? source : `${source.slice(0, footerStart).trimEnd()}\n`;
}

function javascriptRouteTreePlugin() {
  function sanitizeGeneratedFile() {
    try {
      const source = readFileSync(routeTreePath, "utf8");
      const sanitized = removeTypeScriptRouteFooter(source);
      if (sanitized !== source) writeFileSync(routeTreePath, sanitized);
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }

  return {
    name: "javascript-route-tree",
    enforce: "pre",
    configResolved: sanitizeGeneratedFile,
    closeBundle: sanitizeGeneratedFile,
    watchChange(id) {
      if (id.includes("/src/routes/")) sanitizeGeneratedFile();
    },
    transform(source, id) {
      if (id.split("?")[0] === routeTreePath) {
        return removeTypeScriptRouteFooter(source);
      }
    },
  };
}

export default defineConfig({
  plugins: [javascriptRouteTreePlugin()],
  tanstackStart: {
    // Keep generated routes in JavaScript and omit TypeScript-only declarations.
    router: {
      disableTypes: true,
      generatedRouteTree: "routeTree.gen.js",
      routeTreeFileHeader: ["/* eslint-disable */"],
    },
    // Redirect TanStack Start's bundled server entry to src/server.js (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
