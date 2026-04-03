import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import { h, type VNode } from "vue";
import AsyncRenderer from "./AsyncRenderer.vue";

describe("AsyncRenderer 异步渲染组件", () => {
  it("应该渲染同步内容", async () => {
    const content = h("div", {}, "Hello");

    const screen = await render(AsyncRenderer, {
      props: {
        content: content,
      },
    });

    const element = screen.getByText("Hello");
    await expect.element(element).toBeInTheDocument();
  });

  it("应该渲染 VNode 数组", async () => {
    const content: VNode[] = [h("span", { key: 1 }, "First"), h("span", { key: 2 }, "Second")];

    const screen = await render(AsyncRenderer, {
      props: {
        content: content,
      },
    });

    const first = screen.getByText("First");
    const second = screen.getByText("Second");
    await expect.element(first).toBeInTheDocument();
    await expect.element(second).toBeInTheDocument();
  });

  it("应该处理异步内容", async () => {
    const asyncContent = Promise.resolve(h("div", {}, "Async Content"));

    const screen = await render(AsyncRenderer, {
      props: {
        content: asyncContent,
      },
    });

    // 等待异步内容渲染
    await new Promise((resolve) => setTimeout(resolve, 50));

    const element = screen.getByText("Async Content");
    await expect.element(element).toBeInTheDocument();
  });

  it("应该在内容变化时更新", async () => {
    const screen = await render(AsyncRenderer, {
      props: {
        content: h("div", {}, "Initial"),
      },
    });

    const initial = screen.getByText("Initial");
    await expect.element(initial).toBeInTheDocument();

    await screen.rerender({
      content: h("div", {}, "Updated"),
    });

    const updated = screen.getByText("Updated");
    await expect.element(updated).toBeInTheDocument();
  });
});
