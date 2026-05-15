<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { isReasoningUIPart, isTextUIPart, DefaultChatTransport } from "ai";
import { get as getIdbKeyval, set as setIdbKeyval } from "idb-keyval";
import { computed, onMounted, ref, useTemplateRef } from "vue";
import ChatReasoning from "@/components/Chat/ChatReasoning.vue";
import { useChatScroll } from "@/components/Markdown/scroll";

const { BASE_URL } = import.meta.env;

const HISTORY_KEY = `${BASE_URL}translator-messages`;

const MAX_HISTORY_COUNT = 30;
const RETAIN_HISTORY_COUNT = 4;

const limitHistory = <T>(messages: T[]) => {
  if (messages.length > MAX_HISTORY_COUNT) return messages.slice(-RETAIN_HISTORY_COUNT);
  return messages;
};

const input = ref<string>();

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat/translate",
  }),
  onFinish: async ({ messages }) => {
    const limitedMessages = limitHistory(messages);
    chat.messages = limitedMessages;
    await setIdbKeyval(HISTORY_KEY, JSON.stringify(limitedMessages));
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

const scrollTarget = useTemplateRef("scroll-target");
const listTarget = useTemplateRef("list-target");

const { scrollToBottom } = useChatScroll({
  listElement: listTarget,
  scrollTarget,
});

/**
 * 将用户输入的 trimmed 内容发送至翻译 API。
 * 提交后保留输入框内容。
 */
async function onSubmit() {
  const text = input.value?.trim();
  if (!text) return;
  chat.sendMessage({ text });
  await new Promise((resolve) => setTimeout(resolve, 120));
  scrollToBottom({ behavior: "smooth" });
}

async function onInputKeydown(event: KeyboardEvent) {
  if (event.isComposing) return;
  const isPasteChord = (event.ctrlKey || event.metaKey) && event.key.toUpperCase() === "V";
  if (!isPasteChord) return;
  await new Promise((resolve) => setTimeout(resolve, 100));
  await onSubmit();
}

function onSubmitButtonClick() {
  if (chat.status === "error") {
    chat.regenerate();
    return;
  }
  onSubmit();
}

const submitButtonText = computed(() => {
  if (chat.status === "error") return "重试";
  return "提交";
});

const stopButtonClick = () => {
  chat.stop();
};

async function clearHistory() {
  if (chat.status === "streaming" || chat.status === "submitted") chat.stop();
  chat.messages = [];
  input.value = undefined;
}

const assistantMessages = computed(() => {
  return chat.messages.filter((item) => item.role === "assistant");
});
</script>

<template>
  <div class="flex h-screen">
    <div class="flex h-full w-2/5 flex-col px-3 py-3">
      <UserInputTextArea
        v-model="input"
        class="flex-1"
        placeholder="请输入要翻译的内容"
        @keydown="onInputKeydown"
      />
      <p v-if="chat.error" class="text-error mt-2 text-sm">
        {{ chat.error.message }}
      </p>
      <div class="mt-2 flex items-center gap-2">
        <p class="flex-1" />
        <UTooltip v-if="chat.status === 'streaming' || chat.status === 'submitted'" text="停止">
          <UButton
            color="error"
            variant="subtle"
            icon="i-lucide-square"
            aria-label="停止"
            title="停止"
            @click="stopButtonClick"
          />
        </UTooltip>
        <UTooltip v-else text="清除历史记录">
          <UButton
            color="info"
            variant="subtle"
            icon="i-lucide-brush-cleaning"
            aria-label="清除历史记录"
            title="清除历史记录"
            @click="clearHistory"
          />
        </UTooltip>
        <UButton
          color="primary"
          icon="i-lucide-send"
          :loading="chat.status === 'streaming' || chat.status === 'submitted'"
          @click="onSubmitButtonClick"
        >
          {{ submitButtonText }}
        </UButton>
      </div>
    </div>
    <div ref="scroll-target" class="flex-1 overflow-y-auto pl-2">
      <ul ref="list-target" class="flex flex-1 flex-col gap-8 py-4 pr-3">
        <li v-for="message in assistantMessages" :key="message.id" class="flex flex-col gap-4">
          <template v-for="(part, index) in message.parts" :key="index">
            <ChatReasoning v-if="isReasoningUIPart(part)" :text="part.text" />
            <template v-else-if="isTextUIPart(part)">
              <MarkdownContent v-if="message.role === 'assistant'" :content="part.text" />
            </template>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>
