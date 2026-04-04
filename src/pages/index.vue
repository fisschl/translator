<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { isToolStreaming } from "@nuxt/ui/utils/ai";
import {
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  getToolName,
  DefaultChatTransport,
} from "ai";
import { get as getIdbKeyval, set as setIdbKeyval } from "idb-keyval";
import { onMounted, ref } from "vue";

const { BASE_URL } = import.meta.env;

const HISTORY_KEY = `${BASE_URL}translator-messages`;
const MAX_HISTORY = 10;

const input = ref("");

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat/completions",
  }),
  onFinish: async ({ messages }) => {
    await setIdbKeyval(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
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

const scrollToBottom = () => {
  const app = document.getElementById("app");
  if (!(app instanceof HTMLElement)) return;
  app.scrollTo({ top: app.scrollHeight, behavior: "smooth" });
};

/**
 * 将用户输入的 trimmed 内容发送至翻译 API。
 * 提交后清空输入框。
 */
async function onSubmit() {
  const userInput = input.value.trim();
  if (!userInput) return;
  chat.sendMessage({ text: `请帮我翻译以下内容：\n\n${userInput}` });
  input.value = "";
  await new Promise((resolve) => setTimeout(resolve, 1000));
  scrollToBottom();
}
</script>

<template>
  <UContainer>
    <UChatMessages
      :messages="chat.messages"
      :status="chat.status"
      :class="$style.messages"
      class="py-4"
      should-auto-scroll
      should-scroll-to-bottom
    >
      <template #content="{ message }">
        <template v-for="(part, index) in message.parts" :key="index">
          <UChatReasoning
            v-if="isReasoningUIPart(part)"
            icon="i-lucide-brain"
            :text="part.text"
            :streaming="part.state === 'streaming'"
          >
            <p class="whitespace-pre-wrap">{{ part.text }}</p>
          </UChatReasoning>
          <UChatTool
            v-else-if="isToolUIPart(part)"
            :text="getToolName(part)"
            :streaming="isToolStreaming(part)"
          />
          <template v-else-if="isTextUIPart(part)">
            <MarkdownContent v-if="message.role === 'assistant'" :content="part.text" />
            <p v-else-if="message.role === 'user'" class="whitespace-pre-wrap">
              {{ part.text }}
            </p>
          </template>
        </template>
      </template>
    </UChatMessages>
    <UForm v-if="chat.status === 'ready'" class="mb-5 relative" @submit="onSubmit">
      <UTextarea
        v-model="input"
        :rows="3"
        size="lg"
        autoresize
        autofocus
        placeholder="请输入要翻译的内容..."
        class="w-full"
        @keydown.enter.prevent="onSubmit"
        @contextmenu="onContextMenu"
      />
      <UButton type="submit" icon="i-lucide-send" class="absolute bottom-2 right-2" />
    </UForm>
  </UContainer>
</template>

<style module>
.messages {
  min-height: calc(100vh - 300px);
}
</style>
