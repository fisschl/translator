import { describe, it, expect } from "vitest";
import { render } from "vitest-browser-vue";
import WelcomeItem from "./WelcomeItem.vue";

describe("WelcomeItem", () => {
  it("renders slots correctly", async () => {
    const screen = await render(WelcomeItem, {
      slots: {
        icon: '<span data-testid="custom-icon">Icon</span>',
        heading: "Test Heading",
        default: "Test content here",
      },
    });

    await expect
      .element(screen.getByTestId("custom-icon"))
      .toBeInTheDocument();
    await expect.element(screen.getByText("Test Heading")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Test content here"))
      .toBeInTheDocument();
  });

  it("renders heading slot in h3 element", async () => {
    const screen = await render(WelcomeItem, {
      slots: {
        icon: "Icon",
        heading: "My Heading",
        default: "Content",
      },
    });

    const heading = screen.getByRole("heading", {
      level: 3,
      name: "My Heading",
    });
    await expect.element(heading).toBeInTheDocument();
  });

  it("renders complex content in default slot", async () => {
    const screen = await render(WelcomeItem, {
      slots: {
        icon: '<svg data-testid="icon-svg"></svg>',
        heading: "Title",
        default:
          '<p data-testid="paragraph">Paragraph with <a href="#">link</a></p>',
      },
    });

    await expect
      .element(screen.getByTestId("paragraph"))
      .toBeInTheDocument();
    await expect.element(screen.getByRole("link")).toHaveAttribute("href", "#");
  });

  it("renders icon slot correctly", async () => {
    const screen = await render(WelcomeItem, {
      slots: {
        icon: '<div data-testid="slot-icon">🚀</div>',
        heading: "Title",
        default: "Content",
      },
    });

    const icon = screen.getByTestId("slot-icon");
    await expect.element(icon).toBeInTheDocument();
    await expect.element(icon).toHaveTextContent("🚀");
  });

  it("renders multiple items correctly", async () => {
    // 测试组件结构 - 渲染两个 WelcomeItem
    const screen1 = await render(WelcomeItem, {
      slots: {
        icon: "Icon1",
        heading: "First Item",
        default: "First content",
      },
    });

    await expect
      .element(screen1.getByText("First Item"))
      .toBeInTheDocument();

    // cleanup 是自动的，在下一个 render 前执行
    const screen2 = await render(WelcomeItem, {
      slots: {
        icon: "Icon2",
        heading: "Second Item",
        default: "Second content",
      },
    });

    await expect
      .element(screen2.getByText("Second Item"))
      .toBeInTheDocument();
  });
});
