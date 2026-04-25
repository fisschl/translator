import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker.js?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker.js?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import TypeScriptWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?worker";

export const setupMonacoEnvironment = () => {
  if (globalThis.MonacoEnvironment) return;
  globalThis.MonacoEnvironment = {
    getWorker(workerId, label) {
      switch (label) {
        case "json":
          return new JsonWorker({ name: label });
        case "css":
        case "scss":
        case "less":
          return new CssWorker({ name: label });
        case "html":
        case "handlebars":
        case "razor":
          return new HtmlWorker({ name: label });
        case "typescript":
        case "javascript":
          return new TypeScriptWorker({ name: label });
        default:
          return new EditorWorker({ name: label });
      }
    },
  };
};
