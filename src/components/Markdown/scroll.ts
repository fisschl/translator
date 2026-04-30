import { useResizeObserver, useScroll, whenever } from "@vueuse/core";
import { computed, toValue, type MaybeRefOrGetter } from "vue";

export type MaybeHTMLElement = MaybeRefOrGetter<HTMLElement | null | undefined>;

/**
 * 聊天滚动组合函数
 * @param options - 配置选项
 * @param options.scrollTarget - 滚动容器元素
 * @param options.listElement - 列表内容元素，用于监听尺寸变化
 * @returns 包含滚动到底部方法和回到底部标志的对象
 * @remarks
 * 该函数提供智能滚动行为：
 * 1. 初始化时自动滚动到底部
 * 2. 当列表内容变化时，如果用户当前位置接近底部且未向上滚动，则自动滚动到底部
 * 3. 如果用户正在浏览上方内容，则保持当前滚动位置
 */
export const useChatScroll = (options: {
  scrollTarget: MaybeHTMLElement;
  listElement: MaybeHTMLElement;
}) => {
  /**
   * 当滚动条距离底部的距离小于该值时，会自动滚动到底部
   */
  const BOTTOM_THRESHOLD = 200;

  const scrollTarget = computed(() => toValue(options.scrollTarget));
  const { directions, y } = useScroll(scrollTarget);

  /**
   * 是否显示回到底部按钮，距离底部的距离大于 BOTTOM_THRESHOLD 时为 true
   */
  const showBackToBottom = computed(() => {
    const el = scrollTarget.value;
    if (!el) return false;
    return el.scrollHeight - y.value - el.clientHeight > BOTTOM_THRESHOLD;
  });
  /**
   * 滚动到底部
   * @param options - 滚动选项
   * @param options.behavior - 滚动行为，"instant" 为瞬间滚动，"smooth" 为平滑滚动
   */
  const scrollToBottom = (options?: { behavior?: "instant" | "smooth" }) => {
    if (!scrollTarget.value) return;
    scrollTarget.value.scrollTo({
      top: scrollTarget.value.scrollHeight,
      behavior: options?.behavior,
    });
  };

  /**
   * 当滚动容器元素被挂载后，自动滚动到底部
   */
  whenever(scrollTarget, () => {
    const timer = setInterval(scrollToBottom, 24);
    // 持续滚动 1 秒
    setTimeout(() => clearInterval(timer), 1000);
  });

  const listElement = computed(() => toValue(options.listElement));
  useResizeObserver(listElement, () => {
    // 如果正在浏览上方内容，则跳过
    if (showBackToBottom.value) return;
    // 如果正在向上方滚动，则跳过
    if (directions.top) return;
    // 正常情况，自动滚动到底部
    scrollToBottom({ behavior: "smooth" });
  });

  return { scrollToBottom, showBackToBottom };
};
