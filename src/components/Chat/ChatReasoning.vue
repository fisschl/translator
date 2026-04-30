<script setup lang="ts">
import { useThrottleFn } from "@vueuse/core";
import { toRef, useTemplateRef, watch } from "vue";

const props = defineProps<{
  text: string;
}>();

const container = useTemplateRef("container");

const scrollToBottom = useThrottleFn(() => {
  if (!container.value) return;
  const { scrollHeight } = container.value;
  container.value.scrollTo({ top: scrollHeight, behavior: "smooth" });
}, 200);

watch(toRef(props, "text"), scrollToBottom);
</script>

<template>
  <div
    ref="container"
    :class="['overflow-y-auto text-sm text-muted whitespace-pre-wrap', $style.chatReasoning]"
  >
    {{ text }}
  </div>
</template>

<style module>
.chatReasoning {
  --line-height: 16px;
  line-height: var(--line-height);
  max-height: calc(var(--line-height) * 5);
  scrollbar-width: none;
}
</style>
