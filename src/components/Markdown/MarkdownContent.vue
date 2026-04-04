<script setup lang="ts">
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import remend from "remend";
import { unified } from "unified";
import { computed } from "vue";
import MarkdownBlock from "./MarkdownBlock.vue";
import "katex/dist/katex.min.css";
import type { MarkedVuePlugin } from "./plugin";
import "./markdown.css";

const props = defineProps<{
  /** 要渲染的 Markdown 内容字符串 */
  content: string;
  /** 自定义 Vue 插件数组，用于扩展 Markdown 元素的渲染行为 */
  plugins?: MarkedVuePlugin[];
}>();

/**
 * 将 Markdown 按"首层块"分块
 *
 * @param markdown - 原始 Markdown 文本
 * @returns Markdown 块的字符串数组，每个元素代表一个顶级块
 *
 * @remarks
 * 每个顶级块（如段落、标题、代码块）作为一个独立 chunk
 * 使用 unified 处理器解析 Markdown 并将每个块重新序列化为字符串
 */
function chunkMarkdownByTopLevelBlocks(markdown: string) {
  // 解析 Markdown 为 AST，获取顶级子节点
  const { children } = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .parse(remend(markdown));

  // 将每个顶级块节点重新序列化为 Markdown 字符串
  return children.map((blockNode) => {
    return unified()
      .use(remarkGfm)
      .use(remarkMath)
      .use(remarkStringify)
      .stringify({ type: "root", children: [blockNode] });
  });
}

/** 计算属性，存储分块后的 Markdown 内容数组 */
const blocks = computed(() => chunkMarkdownByTopLevelBlocks(props.content));
</script>

<template>
  <article class="markdown-custom prose max-w-none dark:prose-invert" role="article">
    <MarkdownBlock
      v-for="(block, index) in blocks"
      :key="index"
      :content="block"
      :plugins="plugins"
    />
  </article>
</template>
