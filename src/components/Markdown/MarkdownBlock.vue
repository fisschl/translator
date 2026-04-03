<script setup lang="ts">
import type { Root as HastRoot } from "hast";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { computed } from "vue";
import AsyncRenderer from "./AsyncRenderer.vue";
import { CodeBlockPlugin, hastRootToVueVNodes, type MarkedVuePlugin } from "./plugin";

const props = defineProps<{
  /**
   * 要渲染的 Markdown 内容字符串
   */
  content: string;
  /**
   * 自定义 Vue 插件数组，用于扩展 Markdown 元素的渲染行为
   */
  plugins?: MarkedVuePlugin[];
}>();

/**
 * 将 Markdown 内容转换为 HAST (Hypertext Abstract Syntax Tree)
 *
 * @param content - 原始 Markdown 文本
 * @returns Promise，解析为 HAST Root 节点
 *
 * @remarks
 * 处理流程：
 * 1. 使用 unified 处理器将 Markdown 解析为 MDAST
 * 2. 支持 GFM 和数学公式（KaTeX）
 * 3. 将 MDAST 转换为 HAST
 * 4. 使用 rehypeKatex 渲染数学公式为 KaTeX HAST 节点
 * 5. 返回 HAST Root，可直接转换为 Vue VNode
 */
const buildMarkdownToHast = async (content: string): Promise<HastRoot> => {
  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex);

  const mdastTree = processor.parse(content);
  return await processor.run(mdastTree);
};

/**
 * 将 Markdown 转换为 VNode 数组
 *
 * @param content - 原始 Markdown 文本
 * @returns Promise，解析为 VNode 数组
 */
const convertMarkdownToVNodes = async (content: string) => {
  const hastRoot = await buildMarkdownToHast(content);
  // 合并默认插件和用户插件
  const allPlugins = [CodeBlockPlugin, ...(props.plugins || [])];
  return await hastRootToVueVNodes(hastRoot, allPlugins);
};

/** 异步计算 VNode 数组 */
const content = computed(() => convertMarkdownToVNodes(props.content));
</script>

<template>
  <AsyncRenderer :content="content" />
</template>
