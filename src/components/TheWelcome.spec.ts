import { mount } from "@vue/test-utils";
import { describe, it, expect, vi } from "vitest";
import TheWelcome from "./TheWelcome.vue";
import WelcomeItem from "./WelcomeItem.vue";

vi.mock("./icons/IconDocumentation.vue", () => ({
  default: { template: "<span data-testid='doc-icon'>DocIcon</span>" },
}));
vi.mock("./icons/IconTooling.vue", () => ({
  default: { template: "<span data-testid='tool-icon'>ToolIcon</span>" },
}));
vi.mock("./icons/IconEcosystem.vue", () => ({
  default: { template: "<span data-testid='eco-icon'>EcoIcon</span>" },
}));
vi.mock("./icons/IconCommunity.vue", () => ({
  default: { template: "<span data-testid='comm-icon'>CommIcon</span>" },
}));
vi.mock("./icons/IconSupport.vue", () => ({
  default: { template: "<span data-testid='supp-icon'>SuppIcon</span>" },
}));

describe("TheWelcome", () => {
  it("renders 5 WelcomeItem components", () => {
    const wrapper = mount(TheWelcome);
    const welcomeItems = wrapper.findAllComponents(WelcomeItem);
    expect(welcomeItems).toHaveLength(5);
  });

  it("renders Documentation section", () => {
    const wrapper = mount(TheWelcome);
    expect(wrapper.text()).toContain("Documentation");
    expect(wrapper.text()).toContain("official documentation");
  });

  it("renders Tooling section", () => {
    const wrapper = mount(TheWelcome);
    expect(wrapper.text()).toContain("Tooling");
    expect(wrapper.text()).toContain("Vite");
    expect(wrapper.text()).toContain("VSCode");
  });

  it("renders Ecosystem section", () => {
    const wrapper = mount(TheWelcome);
    expect(wrapper.text()).toContain("Ecosystem");
    expect(wrapper.text()).toContain("Pinia");
    expect(wrapper.text()).toContain("Vue Router");
  });

  it("renders Community section", () => {
    const wrapper = mount(TheWelcome);
    expect(wrapper.text()).toContain("Community");
    expect(wrapper.text()).toContain("Vue Land");
    expect(wrapper.text()).toContain("StackOverflow");
  });

  it("renders Support Vue section", () => {
    const wrapper = mount(TheWelcome);
    expect(wrapper.text()).toContain("Support Vue");
    expect(wrapper.text()).toContain("becoming a sponsor");
  });

  it("opens README.md when clicking the link", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);

    const wrapper = mount(TheWelcome);
    const readmeLink = wrapper.find('a[href="javascript:void(0)"]');

    await readmeLink.trigger("click");

    expect(mockFetch).toHaveBeenCalledWith("/__open-in-editor?file=README.md");
  });

  it("has correct external links with proper attributes", () => {
    const wrapper = mount(TheWelcome);
    const externalLinks = wrapper.findAll('a[target="_blank"]');

    expect(externalLinks.length).toBeGreaterThan(0);

    externalLinks.forEach((link) => {
      expect(link.attributes("rel")).toBe("noopener");
    });
  });
});
