import { createContext, useContext, useState } from "react";
const Ctx = createContext(null);
export function AnalysisProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  return (
    <Ctx.Provider
      value={{
        files,
        result,
        setFiles,
        setResult,
        reset: () => {
          setFiles([]);
          setResult(null);
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export function useAnalysis() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAnalysis must be used inside AnalysisProvider");
  return v;
}
