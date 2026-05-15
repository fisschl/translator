<script setup lang="ts">
import { useTemplateRef } from "vue";

defineProps<{
  placeholder?: string;
}>();

const emit = defineEmits<{
  doubleClick: [event: MouseEvent];
  keydown: [event: KeyboardEvent];
}>();

const modelValue = defineModel<string>();

const editorTarget = useTemplateRef("editor-target");

const handleClick = () => {
  const { editor } = editorTarget.value || {};
  if (editor?.isFocused) return;
  editor?.commands.focus();
};
</script>

<template>
  <div
    class="bg-elevated/20 border-default focus-within:border-primary overflow-hidden rounded-md border-2 border-solid"
    @click="handleClick"
    @dblclick="emit('doubleClick', $event)"
    @keydown="emit('keydown', $event)"
  >
    <UEditor
      ref="editor-target"
      v-model="modelValue"
      :class="$style.editor"
      class="max-h-full overflow-auto"
      content-type="markdown"
      :image="false"
      autofocus
      :placeholder="placeholder"
    />
  </div>
</template>

<style module>
.editor :global(.ProseMirror) {
  padding: 0.75rem 1rem;
  min-height: 14rem;
}
</style>
