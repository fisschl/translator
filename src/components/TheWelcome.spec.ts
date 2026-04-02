import { describe, it, expect, vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-vue";
import TheWelcome from "./TheWelcome.vue";

describe("TheWelcome", () => {
  it("renders 5 WelcomeItem sections", async () => {
    const screen = await render(TheWelcome);

    // 使用 heading role 精确匹配，避免文本重复
    await expect
      .element(screen.getByRole("heading", { name: "Documentation" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("heading", { name: "Tooling" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("heading", { name: "Ecosystem" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("heading", { name: "Community" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("heading", { name: "Support Vue" }))
      .toBeInTheDocument();
  });

  it("renders Documentation section with correct content", async () => {
    const screen = await render(TheWelcome);

    await expect
      .element(screen.getByText(/official documentation/i))
      .toBeInTheDocument();
    await expect
      .element(
        screen.getByRole("link", { name: /official documentation/i }),
      )
      .toHaveAttribute("href", "https://vuejs.org/");
  });

  it("renders Tooling section with correct content", async () => {
    const screen = await render(TheWelcome);

    // 使用精确匹配避免匹配到 Vitest
    await expect
      .element(screen.getByRole("link", { name: "Vite", exact: true }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "VSCode" }))
      .toBeInTheDocument();
  });

  it("renders Ecosystem section with correct content", async () => {
    const screen = await render(TheWelcome);

    await expect
      .element(screen.getByRole("link", { name: "Pinia" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "Vue Router" }))
      .toBeInTheDocument();
  });

  it("renders Community section with correct content", async () => {
    const screen = await render(TheWelcome);

    await expect
      .element(screen.getByRole("link", { name: "Vue Land" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByRole("link", { name: "StackOverflow" }))
      .toBeInTheDocument();
  });

  it("opens README.md when clicking the link", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const screen = await render(TheWelcome);

    // 查找 README.md 链接并点击
    const readmeLink = screen.getByRole("link", { name: /README\.md/i });
    await readmeLink.click();

    expect(mockFetch).toHaveBeenCalledWith("/__open-in-editor?file=README.md");
  });

  it("has correct external links with proper attributes", async () => {
    await render(TheWelcome);

    // 获取所有外部链接并验证它们都有正确的属性
    const viteLink = page.getByRole("link", { name: "Vite", exact: true });
    const vsCodeLink = page.getByRole("link", { name: "VSCode" });

    await expect.element(viteLink).toHaveAttribute("target", "_blank");
    await expect.element(viteLink).toHaveAttribute("rel", "noopener");
    await expect.element(vsCodeLink).toHaveAttribute("target", "_blank");
    await expect.element(vsCodeLink).toHaveAttribute("rel", "noopener");
  });

  it("all external links open in new tab", async () => {
    const screen = await render(TheWelcome);

    const viteLink = screen.getByRole("link", { name: "Vite", exact: true });
    const piniaLink = screen.getByRole("link", { name: "Pinia" });

    await expect.element(viteLink).toHaveAttribute("target", "_blank");
    await expect.element(piniaLink).toHaveAttribute("target", "_blank");
  });
});
