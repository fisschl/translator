import type { Element as HastElement, Root as HastRoot } from "hast";
import { toString } from "hast-util-to-string";
import { h, type VNode } from "vue";
import CodeBlock from "./CodeBlock.vue";

/** Promise 或普通值的联合类型 */
export type MaybePromise<T> = T | Promise<T>;

/** 可能为 null 或 undefined 的类型 */
export type Maybe<T> = T | null | undefined;

/**
 * Markdown 插件接口
 *
 * @remarks
 * 用于扩展 Markdown 渲染功能，可以拦截并自定义特定 HAST 元素的渲染逻辑
 */
export interface MarkedVuePlugin {
  /**
   * 插件处理函数
   *
   * @param element - HAST 元素节点
   * @returns VNode 或 null/undefined（表示不处理该元素）
   */
  handler: (element: HastElement) => MaybePromise<Maybe<VNode>>;
}

/**
 * 递归地将 HAST Element 节点转换为 Vue VNode
 *
 * @param element - HAST Element 节点
 * @param plugins - 可选的插件数组，用于拦截和自定义特定元素的渲染
 * @returns Promise，解析为 Vue VNode 对象
 *
 * @remarks
 * 处理流程：
 * 1. 如果提供了插件，先遍历插件尝试处理元素
 * 2. 如果插件返回结果，直接使用插件返回的 VNode 或组件
 * 3. 否则执行默认转换逻辑：
 *    - 递归处理所有子节点
 *    - 文本节点直接转换为字符串
 *    - 元素节点递归转换为 VNode
 *    - 其他类型节点（如注释）被过滤掉
 *    - 使用 HAST 的 properties 作为 VNode 的 props
 */
export async function hastElementToVueVNode(
  element: HastElement,
  plugins: MarkedVuePlugin[] = [],
): Promise<VNode> {
  // 插件拦截逻辑：遍历所有插件尝试处理当前元素
  for (const plugin of plugins) {
    const result = await plugin.handler(element);
    // 如果插件返回 VNode，直接使用
    if (!result) continue;
    return result;
  }
  const children: (VNode | string)[] = [];
  for (const node of element.children) {
    // 文本节点直接返回文本内容
    if (node.type === "text") children.push(node.value);
    // 元素节点递归转换为 VNode，并传递插件
    else if (node.type === "element") children.push(await hastElementToVueVNode(node, plugins));
    // 其他类型节点（如注释）忽略
  }
  // 使用 Vue 的 h 函数创建 VNode
  // HAST 的 tagName 已经是小写，properties 可以直接作为 props 使用
  return h(element.tagName, element.properties ?? {}, children);
}

/**
 * 将 HAST Root 节点转换为 Vue VNode 数组（异步版本）
 *
 * @param root - HAST Root 节点
 * @param plugins - 可选的插件数组，用于拦截和自定义特定元素的渲染
 * @returns Promise，解析为 VNode 数组，每个 VNode 对应一个顶级元素
 *
 * @remarks
 * 用于将 Markdown 解析后的 HAST 树转换为 Vue 可渲染的 VNode 列表。
 * 只处理类型为 'element' 的节点，忽略文本、注释等其他类型节点。
 */
export async function hastRootToVueVNodes(
  root: HastRoot,
  plugins?: MarkedVuePlugin[],
): Promise<VNode[]> {
  const result: VNode[] = [];
  const { children } = root;
  for (const node of children) {
    // 只处理元素节点，忽略文本、注释等其他类型
    if (node.type !== "element") continue;
    // 将元素节点转换为 VNode
    const vnode = await hastElementToVueVNode(node, plugins);
    result.push(vnode);
  }
  return result;
}

/**
 * 从 CSS 类名数组中查找代码块的语言标识
 *
 * 该函数遍历类名数组，查找以 "language-" 开头的类名，
 * 并提取语言标识符（例如从 "language-typescript" 提取 "typescript"）。
 *
 * @param classNames - CSS 类名数组，可能包含各种类型的元素
 * @returns 语言标识符字符串，如果未找到则返回 undefined
 *
 * @remarks
 * 只处理字符串类型的类名，忽略其他类型的元素。
 * 返回第一个匹配的语言标识符。
 */
const findCodeBlockLanguage = (classNames: unknown): string | undefined => {
  const list = Array.isArray(classNames) ? classNames : [classNames];
  for (const element of list) {
    if (typeof element !== "string") continue;
    if (!element.startsWith("language-")) continue;
    return element.replace("language-", "");
  }
};

/**
 * 代码块语法高亮插件
 *
 * @remarks
 * 拦截 <pre><code> 元素，提取语言标识和代码内容，
 * 并使用 CodeBlock 组件进行语法高亮渲染。
 */
export const CodeBlockPlugin: MarkedVuePlugin = {
  handler: (element: HastElement) => {
    // 检测是否为代码块：<pre><code class="language-xxx">
    if (element.tagName !== "pre") return null;
    // 查找 <code> 子元素
    const codeElement = element.children.find(
      (child) => child.type === "element" && child.tagName === "code",
    );
    if (!codeElement || codeElement.type !== "element") return null;
    // 提取语言信息：从 className 中获取 language-xxx
    const { className } = codeElement.properties || {};
    if (!Array.isArray(className)) return null;
    const language = findCodeBlockLanguage(className);
    if (!language) return null;
    // 使用 hast-util-to-string 提取代码内容
    const code = toString(codeElement);
    // 返回 CodeBlock 组件的 VNode
    return h(CodeBlock, { language, code });
  },
};
