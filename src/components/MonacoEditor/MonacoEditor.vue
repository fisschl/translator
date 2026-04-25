<script setup lang="ts">
import { toRef, useColorMode } from "@vueuse/core";
import { editor } from "monaco-editor";
import {
  computed,
  onWatcherCleanup,
  shallowRef,
  useTemplateRef,
  watch,
} from "vue";
import { registerPrettierFormatters } from "./format";
import { setupMonacoEnvironment } from "./language";

const props = defineProps<{
  defaultCode?: string;
  language: string;
}>();

const emit = defineEmits<{
  changeCode: [code: string];
}>();

const colorMode = useColorMode();
const container = useTemplateRef("container-element");
const theme = computed(() => (colorMode.value === "dark" ? "vs-dark" : "vs"));

setupMonacoEnvironment();
registerPrettierFormatters();

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
  editorInstance.onDidChangeModelContent(() => {
    emit("changeCode", editorInstance.getValue());
  });
  onWatcherCleanup(() => editorInstance.dispose());
});

watch(theme, (value) => editor.setTheme(value));

defineExpose({
  instance,
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
