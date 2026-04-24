<script setup lang="ts">
import type { SelectMenuItem } from "@nuxt/ui";
import { ref, useTemplateRef } from "vue";
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor.vue";

const languages: SelectMenuItem[] = [
  { label: "JSON", value: "json" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "CSS", value: "css" },
  { label: "HTML", value: "html" },
];

const language = ref("json");
const editor = useTemplateRef("monaco-editor");

const onFormatClick = async () => {
  await editor.value?.format();
};

const sampleJson = `{
  "name": "translator",
  "version": "1.0.0",
  "features": ["translate", "format", "preview"],
  "editor": {
    "language": "json",
    "theme": "vs",
    "readOnly": false
  }
}`;
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
      :default-code="sampleJson"
      class="flex-1 min-h-0"
    />
  </section>
</template>
