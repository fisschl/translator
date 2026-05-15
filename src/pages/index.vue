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

/**
 * 双击输入区时：若当前为空，读取系统剪贴板并填入后自动提交。
 *
 * @param event - 双击触发的鼠标事件。
 */
async function onUserInputDoubleClick(event: MouseEvent) {
  if (input.value?.trim()) return;
  event.preventDefault();
  const text = await navigator.clipboard.readText();
  if (!text) return;
  input.value = text;
  if (chat.status === "streaming" || chat.status === "submitted") return;
  onSubmit();
}

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

function onInputKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
  event.preventDefault();
  onSubmit();
}

function onSubmitButtonClick() {
  if (chat.status === "streaming" || chat.status === "submitted") {
    chat.stop();
    return;
  }
  if (chat.status === "error") {
    chat.regenerate();
    return;
  }
  onSubmit();
}

const submitButtonLabel = computed(() => {
  if (chat.status === "streaming" || chat.status === "submitted") return "停止";
  if (chat.status === "error") return "重试";
  return "提交";
});

async function clearHistory() {
  if (chat.status === "streaming" || chat.status === "submitted") chat.stop();
  chat.messages = [];
  await setIdbKeyval(HISTORY_KEY, JSON.stringify([]));
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
        @double-click="onUserInputDoubleClick"
        @keydown="onInputKeydown"
      />
      <p v-if="chat.error" class="text-error mt-2 text-sm">
        {{ chat.error.message }}
      </p>
      <div class="mt-2 flex items-center gap-2">
        <p class="flex-1" />
        <UTooltip text="清除历史记录">
          <UButton
            color="info"
            variant="subtle"
            icon="i-lucide-brush-cleaning"
            aria-label="清除历史记录"
            title="清除历史记录"
            @click="clearHistory"
          />
        </UTooltip>
        <UButton color="primary" icon="i-lucide-send" @click="onSubmitButtonClick">
          {{ submitButtonLabel }}
        </UButton>
      </div>
    </div>
    <div ref="scroll-target" class="flex-1 overflow-y-auto pl-2">
      <ul ref="list-target" class="flex flex-1 flex-col gap-4 py-4 pr-3">
        <li v-for="message in assistantMessages" :key="message.id" class="flex flex-col gap-3">
          <template v-for="(part, index) in message.parts" :key="index">
            <ChatReasoning v-if="isReasoningUIPart(part)" :text="part.text" class="mb-3" />
            <template v-else-if="isTextUIPart(part)">
              <MarkdownContent v-if="message.role === 'assistant'" :content="part.text" />
            </template>
          </template>
        </li>
      </ul>
    </div>
  </div>
</template>
