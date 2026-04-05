<script setup lang="ts">
import { useChatScroll } from "@/components/Markdown/scroll";
import ReasoningIcon from "@/components/ReasoningIcon.vue";
import { Chat } from "@ai-sdk/vue";
import { isReasoningUIPart, isTextUIPart, DefaultChatTransport } from "ai";
import { get as getIdbKeyval, set as setIdbKeyval } from "idb-keyval";
import { onMounted, ref, useTemplateRef } from "vue";

const { BASE_URL } = import.meta.env;

const HISTORY_KEY = `${BASE_URL}translator-messages`;

const input = ref("");

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat/completions",
  }),
  onFinish: async ({ messages }) => {
    // 只保留最后 20 条记录(同时限制内存和本地存储)
    const recentMessages = messages.slice(-20);
    chat.messages = recentMessages;
    await setIdbKeyval(HISTORY_KEY, JSON.stringify(recentMessages));
  },
});

/**
 * 从 IndexedDB 读取持久化的聊天历史记录。
 *
 * @returns 解析后的消息历史；若未存储或解析失败则返回空数组。
 */
const readHistory = async () => {
  const raw = await getIdbKeyval<string>(HISTORY_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

/**
 * 生命周期钩子，在组件挂载时从 IndexedDB 恢复聊天历史记录。
 */
onMounted(async () => {
  const history = await readHistory();
  if (history?.length) chat.messages = history;
});

/**
 * 处理文本框上的右键菜单事件。
 * 当文本框为空时，读取系统剪贴板内容并粘贴，随后自动提交表单。
 *
 * @param event - 右键点击触发的鼠标事件。
 */
async function onContextMenu(event: MouseEvent) {
  if (input.value.trim()) return;
  event.preventDefault();
  const text = await navigator.clipboard.readText();
  if (!text) return;
  input.value = text;
  onSubmit();
}

const listTarget = useTemplateRef("list-target");
const scrollTarget = ref<HTMLElement | null>(null);

onMounted(() => {
  const main = document.getElementById("main");
  if (!(main instanceof HTMLElement)) return;
  scrollTarget.value = main;
});

const { scrollToBottom } = useChatScroll({ listElement: listTarget, scrollTarget });

/**
 * 将用户输入的 trimmed 内容发送至翻译 API。
 * 提交后清空输入框。
 */
async function onSubmit() {
  const userInput = input.value.trim();
  if (!userInput) return;
  chat.sendMessage({ text: `请帮我翻译以下内容：\n\n${userInput}` });
  input.value = "";
  await new Promise((resolve) => setTimeout(resolve, 120));
  scrollToBottom({ behavior: "smooth" });
}
</script>

<template>
  <ul ref="list-target" class="flex flex-col flex-1 gap-10 py-8 px-4">
    <li
      v-for="message in chat.messages"
      :key="message.id"
      class="flex gap-3 flex-col"
      :class="{
        'self-end max-w-4/5': message.role === 'user',
      }"
    >
      <template v-for="(part, index) in message.parts" :key="index">
        <div
          v-if="isReasoningUIPart(part) && part.state === 'streaming'"
          class="flex items-center gap-2 text-muted"
        >
          <ReasoningIcon />
          <UChatShimmer text="思考中" class="text-sm" />
        </div>
        <template v-else-if="isTextUIPart(part)">
          <MarkdownContent v-if="message.role === 'assistant'" :content="part.text" />
          <p
            v-else-if="message.role === 'user'"
            class="whitespace-pre-wrap bg-elevated/50 py-3 px-4 rounded-lg"
          >
            {{ part.text }}
          </p>
        </template>
      </template>
    </li>
  </ul>
  <UChatPrompt
    v-model="input"
    class="mb-4 mx-4 w-auto sticky bottom-4"
    :error="chat.error"
    placeholder="请输入要翻译的内容（单击右键快速翻译复制的内容）"
    @contextmenu="onContextMenu"
    @submit="onSubmit"
  >
    <UChatPromptSubmit :status="chat.status" @stop="chat.stop()" @reload="chat.regenerate()" />
  </UChatPrompt>
</template>
