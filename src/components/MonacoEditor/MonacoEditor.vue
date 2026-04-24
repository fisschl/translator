<script setup lang="ts">
import { toRef, useColorMode } from "@vueuse/core";
import { editor } from "monaco-editor";
import EditorWorker from "monaco-editor/esm/vs/editor/editor.worker.js?worker";
import CssWorker from "monaco-editor/esm/vs/language/css/css.worker.js?worker";
import HtmlWorker from "monaco-editor/esm/vs/language/html/html.worker.js?worker";
import JsonWorker from "monaco-editor/esm/vs/language/json/json.worker.js?worker";
import TypeScriptWorker from "monaco-editor/esm/vs/language/typescript/ts.worker.js?worker";
import { computed, onWatcherCleanup, shallowRef, useTemplateRef, watch } from "vue";
import { format as formatCode } from "./format";

const props = defineProps<{
  defaultCode?: string;
  language?: string;
}>();

const colorMode = useColorMode();
const container = useTemplateRef("container-element");
const theme = computed(() => (colorMode.value === "dark" ? "vs-dark" : "vs"));

const setupMonacoEnvironment = () => {
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

setupMonacoEnvironment();

const instance = shallowRef<editor.IStandaloneCodeEditor>();
const language = toRef(props, "language");

watch(language, (lang) => {
  const editorInstance = instance.value;
  const model = editorInstance?.getModel();
  if (!editorInstance || !model) return;
  editor.setModelLanguage(model, lang || "plaintext");
});

watch(container, (element) => {
  if (!element) return;
  const editorInstance = editor.create(element, {
    value: props.defaultCode,
    language: props.language,
    theme: theme.value,
    fontFamily: '"Cascadia Code", "Noto Sans SC", monospace',
    fontSize: 15,
  });
  instance.value = editorInstance;
  onWatcherCleanup(() => editorInstance.dispose());
});

watch(theme, (value) => editor.setTheme(value));

const format = async () => {
  const editorInstance = instance.value;
  if (!editorInstance || !props.language) return;
  const formatted = await formatCode(editorInstance.getValue(), props.language);
  editorInstance.setValue(formatted);
};

defineExpose({
  instance,
  format,
});
</script>

<template>
  <article ref="container-element" :class="$style.editor" />
</template>

<style module>
.editor {
  overflow: hidden;
}
</style>
