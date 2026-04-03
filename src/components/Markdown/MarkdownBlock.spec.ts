import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import MarkdownBlock from "./MarkdownBlock.vue";

describe("MarkdownBlock Markdown块组件", () => {
  it("应该渲染简单文本", async () => {
    const screen = await render(MarkdownBlock, {
      props: {
        content: "Hello World",
      },
    });

    const text = screen.getByText("Hello World");
    await expect.element(text).toBeInTheDocument();
  });

  it("应该渲染标题", async () => {
    const screen = await render(MarkdownBlock, {
      props: {
        content: "# Heading 1",
      },
    });

    const heading = screen.getByRole("heading", { level: 1 });
    await expect.element(heading).toBeInTheDocument();
    await expect.element(heading).toHaveTextContent("Heading 1");
  });

  it("应该渲染粗体文本", async () => {
    const screen = await render(MarkdownBlock, {
      props: {
        content: "**bold text**",
      },
    });

    const text = screen.getByText("bold text");
    await expect.element(text).toBeInTheDocument();
  });

  it("应该渲染斜体文本", async () => {
    const screen = await render(MarkdownBlock, {
      props: {
        content: "*italic text*",
      },
    });

    const text = screen.getByText("italic text");
    await expect.element(text).toBeInTheDocument();
  });

  it("应该渲染链接", async () => {
    const screen = await render(MarkdownBlock, {
      props: {
        content: "[link text](https://example.com)",
      },
    });

    const link = screen.getByRole("link", { name: "link text" });
    await expect.element(link).toBeInTheDocument();
    await expect.element(link).toHaveAttribute("href", "https://example.com");
  });

  it("应该渲染列表项", async () => {
    const screen = await render(MarkdownBlock, {
      props: {
        content: "- item 1\n- item 2",
      },
    });

    const item1 = screen.getByText("item 1");
    const item2 = screen.getByText("item 2");
    await expect.element(item1).toBeInTheDocument();
    await expect.element(item2).toBeInTheDocument();
  });

  it("应该渲染代码块", async () => {
    const { container } = await render(MarkdownBlock, {
      props: {
        content: "```typescript\nconst x = 1;\n```",
      },
    });

    // 等待异步渲染完成
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 验证包含 code 标签
    const codeElement = container.querySelector("code");
    expect(codeElement).toBeTruthy();

    // 验证代码内容包含关键字符
    const codeText = codeElement?.textContent || "";
    expect(codeText).toContain("const");
    expect(codeText).toContain("x");
    expect(codeText).toContain("=");
    expect(codeText).toContain("1");
  });
});
