<script setup lang="ts">
import pLimit from "p-limit";
import { shallowRef, watchEffect, type FunctionalComponent, type VNode } from "vue";

/** 可能是 Promise 或普通值的联合类型 */
type MaybePromise<T> = T | Promise<T>;
/** 可能是数组或单个值的联合类型 */
type MaybeArray<T> = T | T[];

/** 内容节点类型 - 支持单个 VNode、null 或它们的数组 */
type ContentNodes = MaybeArray<VNode | null>;

const props = defineProps<{
  /** 要渲染的内容，可以是同步 VNode 或异步 Promise */
  content: MaybePromise<ContentNodes>;
}>();

/**
 * 并发限制器
 *
 * 限制同一时间只处理一个高亮任务，避免多个异步渲染任务同时执行
 * 导致性能问题或竞态条件。
 */
const limit = pLimit(1);

/**
 * 存储转换后的 VNode 数组
 *
 * 使用 shallowRef 而不是 ref，因为 VNode 对象是内部结构，
 * 不需要深度响应式转换，可以提高性能。
 */
const vNodes = shallowRef<ContentNodes>([]);

/**
 * 监听内容变化并异步处理
 *
 * 当 props.content 变化时，使用 limit 包装异步操作，
 * 确保前一个渲染完成后才开始新的渲染。
 */
watchEffect(() => {
  const { content } = props;
  limit(async () => (vNodes.value = await content));
});

/**
 * 子组件 - 函数式组件
 *
 * 使用函数式组件直接渲染 vNodes 的内容，避免额外的组件实例开销。
 * 如果 vNodes 为空则返回 null（不渲染任何内容）。
 */
const Child: FunctionalComponent = () => {
  if (!vNodes.value) return null;
  return vNodes.value;
};
</script>

<template>
  <Child />
</template>
