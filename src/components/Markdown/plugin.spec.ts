import type { Element as HastElement, Root as HastRoot } from "hast";
import { describe, it, expect } from "vitest";
import { h } from "vue";
import { hastElementToVueVNode, hastRootToVueVNodes, type MarkedVuePlugin } from "./plugin";

describe("hastElementToVueVNode - 将 HAST 元素节点转换为 Vue VNode", () => {
  it("应该将简单元素转换为 VNode", async () => {
    const element: HastElement = {
      type: "element",
      tagName: "div",
      properties: {},
      children: [{ type: "text", value: "Hello" }],
    };

    const vnode = await hastElementToVueVNode(element);

    expect(vnode).toBeDefined();
    expect(vnode.type).toBe("div");
  });

  it("应该处理嵌套元素", async () => {
    const element: HastElement = {
      type: "element",
      tagName: "div",
      properties: {},
      children: [
        {
          type: "element",
          tagName: "span",
          properties: {},
          children: [{ type: "text", value: "Nested" }],
        },
      ],
    };

    const vnode = await hastElementToVueVNode(element);

    expect(vnode).toBeDefined();
    expect(vnode.type).toBe("div");
  });

  it("应该应用插件", async () => {
    const customVNode = h("custom", {}, "Custom");
    const plugin: MarkedVuePlugin = {
      handler: () => customVNode,
    };

    const element: HastElement = {
      type: "element",
      tagName: "div",
      properties: {},
      children: [],
    };

    const vnode = await hastElementToVueVNode(element, [plugin]);

    expect(vnode).toBe(customVNode);
  });

  it("应该在插件返回 null 时跳过插件", async () => {
    const plugin: MarkedVuePlugin = {
      handler: () => null,
    };

    const element: HastElement = {
      type: "element",
      tagName: "div",
      properties: {},
      children: [{ type: "text", value: "Hello" }],
    };

    const vnode = await hastElementToVueVNode(element, [plugin]);

    expect(vnode).toBeDefined();
    expect(vnode.type).toBe("div");
  });

  it("应该正确处理属性", async () => {
    const element: HastElement = {
      type: "element",
      tagName: "a",
      properties: { href: "https://example.com", className: ["link"] },
      children: [{ type: "text", value: "Link" }],
    };

    const vnode = await hastElementToVueVNode(element);

    expect(vnode).toBeDefined();
    expect(vnode.type).toBe("a");
  });
});

describe("hastRootToVueVNodes - 将 HAST 根节点转换为 Vue VNode 数组", () => {
  it("应该转换包含多个子节点的根节点", async () => {
    const root: HastRoot = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "h1",
          properties: {},
          children: [{ type: "text", value: "Title" }],
        },
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "Paragraph" }],
        },
      ],
    };

    const vnodes = await hastRootToVueVNodes(root);

    expect(vnodes).toHaveLength(2);
    expect(vnodes[0].type).toBe("h1");
    expect(vnodes[1].type).toBe("p");
  });

  it("应该过滤掉非元素节点", async () => {
    const root: HastRoot = {
      type: "root",
      children: [
        { type: "text", value: "Text node" },
        {
          type: "element",
          tagName: "div",
          properties: {},
          children: [],
        },
        { type: "comment", value: "Comment" },
      ],
    };

    const vnodes = await hastRootToVueVNodes(root);

    expect(vnodes).toHaveLength(1);
    expect(vnodes[0].type).toBe("div");
  });

  it("应该将插件传递给子节点", async () => {
    const customVNode = h("custom", {}, "Custom");
    const plugin: MarkedVuePlugin = {
      handler: (el) => (el.tagName === "p" ? customVNode : null),
    };

    const root: HastRoot = {
      type: "root",
      children: [
        {
          type: "element",
          tagName: "p",
          properties: {},
          children: [{ type: "text", value: "Text" }],
        },
      ],
    };

    const vnodes = await hastRootToVueVNodes(root, [plugin]);

    expect(vnodes).toHaveLength(1);
    expect(vnodes[0]).toBe(customVNode);
  });
});

describe("CodeBlockPlugin - 代码块语法高亮插件", () => {
  it("应该对非 pre 元素返回 null", async () => {
    const { CodeBlockPlugin } = await import("./plugin");

    const element: HastElement = {
      type: "element",
      tagName: "div",
      properties: {},
      children: [],
    };

    const result = await CodeBlockPlugin.handler(element);

    expect(result).toBeNull();
  });

  it("应该对没有 code 子元素的 pre 返回 null", async () => {
    const { CodeBlockPlugin } = await import("./plugin");

    const element: HastElement = {
      type: "element",
      tagName: "pre",
      properties: {},
      children: [{ type: "text", value: "plain text" }],
    };

    const result = await CodeBlockPlugin.handler(element);

    expect(result).toBeNull();
  });

  it("应该对没有 language 类名的 code 返回 null", async () => {
    const { CodeBlockPlugin } = await import("./plugin");

    const element: HastElement = {
      type: "element",
      tagName: "pre",
      properties: {},
      children: [
        {
          type: "element",
          tagName: "code",
          properties: { className: ["code-block"] },
          children: [{ type: "text", value: "const x = 1;" }],
        },
      ],
    };

    const result = await CodeBlockPlugin.handler(element);

    expect(result).toBeNull();
  });

  it("应该对包含 language 类名的代码块返回 VNode", async () => {
    const { CodeBlockPlugin } = await import("./plugin");

    const element: HastElement = {
      type: "element",
      tagName: "pre",
      properties: {},
      children: [
        {
          type: "element",
          tagName: "code",
          properties: { className: ["language-typescript"] },
          children: [{ type: "text", value: "const x = 1;" }],
        },
      ],
    };

    const result = await CodeBlockPlugin.handler(element);

    expect(result).toBeDefined();
    expect(result?.type).toBeDefined();
  });
});
