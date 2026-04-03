import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import App from "./App.vue";
import { router } from "./router";

describe("App 根组件", () => {
  it("应该正确渲染应用头部组件 AppHeader", async () => {
    // 导航到根路由
    await router.push("/");
    await router.isReady();

    const screen = await render(App, {
      global: {
        plugins: [router],
      },
    });

    // 验证 AppHeader 组件被渲染
    const header = screen.getByRole("banner");
    await expect.element(header).toBeInTheDocument();
  });

  it("应该正确渲染主要内容区域 UMain", async () => {
    // 导航到根路由
    await router.push("/");
    await router.isReady();

    const screen = await render(App, {
      global: {
        plugins: [router],
      },
    });

    // 验证 UMain 组件被渲染
    const main = screen.getByRole("main");
    await expect.element(main).toBeInTheDocument();
  });
});
