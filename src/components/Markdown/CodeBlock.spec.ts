import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import CodeBlock from "./CodeBlock.vue";

describe("CodeBlock 代码块组件", () => {
  it("应该渲染代码块容器", async () => {
    const screen = await render(CodeBlock, {
      props: {
        language: "typescript",
        code: "const x = 1;",
      },
    });

    const container = screen.container.querySelector("div");
    await expect.element(container).toBeInTheDocument();
  });

  it("应该渲染不同类型的代码", async () => {
    const codeSamples = [
      { language: "typescript", code: "const x = 1;" },
      { language: "javascript", code: "console.log('test');" },
      { language: "python", code: "print('hello')" },
      { language: "rust", code: "fn main() {}" },
      { language: "go", code: "func main() {}" },
    ];

    for (const sample of codeSamples) {
      const screen = await render(CodeBlock, {
        props: {
          language: sample.language,
          code: sample.code,
        },
      });

      const container = screen.container.querySelector("div");
      await expect.element(container).toBeInTheDocument();
    }
  });
});
