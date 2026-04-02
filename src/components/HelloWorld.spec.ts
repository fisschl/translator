import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import HelloWorld from "./HelloWorld.vue";

describe("HelloWorld", () => {
  it("renders properly", async () => {
    const screen = await render(HelloWorld, {
      props: { msg: "Hello Vitest" },
    });

    await expect.element(screen.getByText("Hello Vitest")).toBeInTheDocument();
  });

  it("renders message in h1 element", async () => {
    const screen = await render(HelloWorld, {
      props: { msg: "Test Message" },
    });

    const heading = screen.getByRole("heading", { level: 1 });
    await expect.element(heading).toHaveTextContent("Test Message");
  });

  it("renders documentation links", async () => {
    const screen = await render(HelloWorld, {
      props: { msg: "Hello" },
    });

    const viteLink = screen.getByRole("link", { name: /vite/i });
    const vueLink = screen.getByRole("link", { name: /vue 3/i });

    await expect.element(viteLink).toHaveAttribute("href", "https://vite.dev/");
    await expect.element(vueLink).toHaveAttribute("href", "https://vuejs.org/");
  });
});
