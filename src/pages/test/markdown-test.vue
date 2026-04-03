<script setup lang="ts">
import { ref } from "vue";
import MarkdownContent from "@/components/Markdown/MarkdownContent.vue";

const markdownText = ref(`# Markdown 组件测试

这是一个用于测试 **MarkdownContent** 组件的页面。

## 功能特性

- 支持 *斜体* 和 **粗体** 文本
- 支持 [链接](https://example.com)
- 支持代码块
- 支持数学公式
- 支持表格

### 代码示例

\`\`\`typescript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

\`\`\`python
def hello():
    return "Hello from Python!"
\`\`\`

### 数学公式

行内公式: $E = mc^2$

### 表格

| 名称 | 类型 | 描述 |
|------|------|------|
| name | string | 用户名 |
| age | number | 年龄 |

### 列表

1. 第一项
2. 第二项
   - 子项 A
   - 子项 B
3. 第三项

> 这是一段引用文本。
> 可以有多行。

---

*最后更新：2026年4月*
`);
</script>

<template>
  <MarkdownContent :content="markdownText" />
</template>

<style module></style>
