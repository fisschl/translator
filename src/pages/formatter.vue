<script setup lang="ts">
import { useDebounceFn, whenever } from "@vueuse/core";
import { get as getIdb, set as setIdb } from "idb-keyval";
import { computed, ref, useTemplateRef } from "vue";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor.vue";

const languages = [
  { label: "JSON", value: "json" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "CSS", value: "css" },
  { label: "HTML", value: "html" },
];

const language = ref("json");

const editorElement = useTemplateRef("monaco-editor");

const CODE_STORAGE_KEY = `translator:formatter:code`;
const LANGUAGE_STORAGE_KEY = `translator:formatter:language`;

getIdb(LANGUAGE_STORAGE_KEY).then((lang) => {
  if (!lang || typeof lang !== "string") return;
  language.value = lang;
});

const handleChangeCode = useDebounceFn(async (code: string) => {
  await setIdb(CODE_STORAGE_KEY, code);
  await setIdb(LANGUAGE_STORAGE_KEY, language.value);
}, 500);

const editor = computed(() => editorElement.value?.instance);

whenever(editor, async (editor) => {
  const code = await getIdb(CODE_STORAGE_KEY);
  if (!code || typeof code !== "string") return;
  editor.setValue(code);
});

const onFormatClick = async () => {
  await editor.value?.getAction("editor.action.formatDocument")?.run();
};
</script>

<template>
  <section class="flex flex-col flex-1 min-h-0">
    <div class="px-2 pt-2 pb-2">
      <div class="flex items-center gap-2">
        <USelectMenu v-model="language" value-key="value" :items="languages" class="w-48" />
        <UButton
          icon="i-lucide-brush"
          color="neutral"
          variant="ghost"
          square
          aria-label="格式化"
          @click="onFormatClick"
        />
      </div>
    </div>
    <MonacoEditor
      ref="monaco-editor"
      :language="language"
      class="flex-1 min-h-0"
      @change-code="handleChangeCode"
    />
  </section>
</template>
