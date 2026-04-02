import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import WelcomeItem from "./WelcomeItem.vue";

describe("WelcomeItem", () => {
  it("renders slots correctly", () => {
    const wrapper = mount(WelcomeItem, {
      slots: {
        icon: '<span class="test-icon">Icon</span>',
        heading: "Test Heading",
        default: "Test content here",
      },
    });

    expect(wrapper.find(".test-icon").exists()).toBe(true);
    expect(wrapper.text()).toContain("Test Heading");
    expect(wrapper.text()).toContain("Test content here");
  });

  it("has correct CSS module classes", () => {
    const wrapper = mount(WelcomeItem, {
      slots: {
        icon: "Icon",
        heading: "Heading",
        default: "Content",
      },
    });

    expect(wrapper.find("[class*='item']").exists()).toBe(true);
    expect(wrapper.find("[class*='icon']").exists()).toBe(true);
    expect(wrapper.find("[class*='details']").exists()).toBe(true);
    expect(wrapper.find("[class*='heading']").exists()).toBe(true);
  });

  it("renders icon slot in icon element", () => {
    const wrapper = mount(WelcomeItem, {
      slots: {
        icon: '<svg data-testid="custom-icon"></svg>',
        heading: "Title",
      },
    });

    const iconSlot = wrapper.find('[data-testid="custom-icon"]');
    expect(iconSlot.exists()).toBe(true);
  });

  it("renders heading slot in h3 element", () => {
    const wrapper = mount(WelcomeItem, {
      slots: {
        icon: "Icon",
        heading: "My Heading",
        default: "Content",
      },
    });

    const h3 = wrapper.find("h3");
    expect(h3.exists()).toBe(true);
    expect(h3.text()).toBe("My Heading");
  });

  it("renders default slot in details div", () => {
    const wrapper = mount(WelcomeItem, {
      slots: {
        icon: "Icon",
        heading: "Title",
        default: '<p data-testid="paragraph">Paragraph content</p>',
      },
    });

    const paragraph = wrapper.find('[data-testid="paragraph"]');
    expect(paragraph.exists()).toBe(true);
  });
});
