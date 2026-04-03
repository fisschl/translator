import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import { router } from "../router";
import AppHeader from "./AppHeader.vue";

describe("AppHeader 应用头部组件", () => {
  it("应该正确渲染应用标题", async () => {
    await router.push("/");
    await router.isReady();

    const screen = await render(AppHeader, {
      global: {
        plugins: [router],
      },
    });

    // 验证标题文本（使用精确匹配）
    const titleElement = screen.getByRole("link", { name: "翻译", exact: true });
    await expect.element(titleElement).toBeInTheDocument();
  });

  it("应该在根路由时正确显示文本翻译导航项", async () => {
    await router.push("/");
    await router.isReady();

    const screen = await render(AppHeader, {
      global: {
        plugins: [router],
      },
    });

    // 验证导航菜单项
    const navItem = screen.getByRole("link", { name: "文本翻译" });
    await expect.element(navItem).toBeInTheDocument();
    // 路由 to="/" 会被解析为完整路径
    await expect.element(navItem).toHaveAttribute("href", "/");
  });

  it("应该在非根路由时文本翻译导航项不处于激活状态", async () => {
    // 导航到一个不存在的路由来测试非激活状态
    await router.push("/about");
    await router.isReady();

    const screen = await render(AppHeader, {
      global: {
        plugins: [router],
      },
    });

    // 验证导航项存在但不激活
    const navItem = screen.getByRole("link", { name: "文本翻译" });
    await expect.element(navItem).toBeInTheDocument();
    // 非根路由时，active 应该为 false
    await expect.element(navItem).not.toHaveAttribute("data-active");
  });
});
