<script setup lang="ts">
import { codeToHast } from "shiki";
import { computed } from "vue";
import AsyncRenderer from "./AsyncRenderer.vue";
import { hastRootToVueVNodes } from "./plugin";

const props = defineProps<{
  language: string;
  code: string;
}>();

/**
 * 使用 Shiki 进行代码语法高亮
 *
 * @param code - 源代码字符串
 * @param language - 编程语言标识
 * @returns VNode 数组
 */
const highlight = async (code: string, language: string) => {
  // 使用 Shiki 将代码转换为 HAST
  const hast = await codeToHast(code, {
    lang: language,
    theme: "catppuccin-frappe",
  });
  return hastRootToVueVNodes(hast);
};

/** 异步计算高亮后的 VNode 数组 */
const content = computed(() => highlight(props.code, props.language));
</script>

<template>
  <AsyncRenderer :content="content" />
</template>
