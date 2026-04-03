import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import MarkdownContent from "./MarkdownContent.vue";

describe("MarkdownContent Markdown内容组件", () => {
  it("应该渲染简单 Markdown 文本", async () => {
    const screen = await render(MarkdownContent, {
      props: {
        content: "Hello World",
      },
    });

    const text = screen.getByText("Hello World");
    await expect.element(text).toBeInTheDocument();
  });

  it("应该渲染多个段落", async () => {
    const screen = await render(MarkdownContent, {
      props: {
        content: "First paragraph.\n\nSecond paragraph.",
      },
    });

    const first = screen.getByText("First paragraph.");
    const second = screen.getByText("Second paragraph.");
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();
  });

  it("应该渲染标题层级", async () => {
    const screen = await render(MarkdownContent, {
      props: {
        content: "# H1\n## H2\n### H3",
      },
    });

    const h1 = screen.getByRole("heading", { level: 1 });
    const h2 = screen.getByRole("heading", { level: 2 });
    const h3 = screen.getByRole("heading", { level: 3 });

    await expect.element(h1).toBeInTheDocument();
    await expect.element(h2).toBeInTheDocument();
    await expect.element(h3).toBeInTheDocument();
  });

  it("应该渲染表格", async () => {
    const screen = await render(MarkdownContent, {
      props: {
        content: "| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |",
      },
    });

    const cell1 = screen.getByText("Cell 1");
    const cell2 = screen.getByText("Cell 2");
    await expect.element(cell1).toBeInTheDocument();
    await expect.element(cell2).toBeInTheDocument();
  });

  it("应该渲染数学公式", async () => {
    const screen = await render(MarkdownContent, {
      props: {
        content: "$E = mc^2$",
      },
    });

    // 数学公式应该被渲染
    const article = screen.getByRole("article");
    await expect.element(article).toBeInTheDocument();
  });

  it("应该使用 prose 和 markdown-custom 类", async () => {
    const screen = await render(MarkdownContent, {
      props: {
        content: "Test content",
      },
    });

    const article = screen.getByRole("article");
    await expect.element(article).toHaveClass("prose");
    await expect.element(article).toHaveClass("max-w-none");
    await expect.element(article).toHaveClass("dark:prose-invert");
  });

  it("应该渲染复杂 Markdown 文档", async () => {
    const content = `
# Document Title

This is a paragraph with **bold** and *italic* text.

## Section 1

- List item 1
- List item 2

### Subsection

\`\`\`typescript
const greeting = "Hello";
console.log(greeting);
\`\`\`

## Section 2

[Visit Example](https://example.com)
    `.trim();

    const screen = await render(MarkdownContent, {
      props: { content },
    });

    const title = screen.getByRole("heading", { level: 1 });
    await expect.element(title).toHaveTextContent("Document Title");

    // 等待异步渲染完成
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 验证代码块渲染，检查 code 标签和代码内容
    const codeElement = screen.container.querySelector("code");
    expect(codeElement).toBeTruthy();
    const codeText = codeElement?.textContent || "";
    expect(codeText).toContain("const");
    expect(codeText).toContain("greeting");
    expect(codeText).toContain("console.log");
  });
});
