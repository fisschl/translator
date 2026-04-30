<script setup lang="ts">
import { Chat } from "@ai-sdk/vue";
import { isReasoningUIPart, isTextUIPart, DefaultChatTransport } from "ai";
import { get as getIdbKeyval, set as setIdbKeyval } from "idb-keyval";
import { computed, onMounted, ref, useTemplateRef } from "vue";
import { useChatScroll } from "@/components/Markdown/scroll";
import ReasoningIcon from "@/components/ReasoningIcon.vue";

const { BASE_URL } = import.meta.env;

const HISTORY_KEY = `${BASE_URL}translator-messages`;
const MODEL_KEY = `${BASE_URL}translator-model`;
const THINKING_KEY = `${BASE_URL}translator-thinking-enabled`;
const MAX_HISTORY_COUNT = 30;
const RETAIN_HISTORY_COUNT = 4;

const limitHistory = <T>(messages: T[]) => {
  if (messages.length > MAX_HISTORY_COUNT) return messages.slice(-RETAIN_HISTORY_COUNT);
  return messages;
};

const input = ref("");
const model = ref("deepseek-v4-flash");
const thinkingEnabled = ref(false);

const models = [
  { value: "deepseek-v4-flash", label: "DeepSeek V4 Flash" },
  { value: "deepseek-v4-pro", label: "DeepSeek V4 Pro" },
];

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat/completions",
    body: () => ({
      model: model.value,
      thinking: { type: thinkingEnabled.value ? "enabled" : "disabled" },
    }),
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
  const persistedModel = await getIdbKeyval<string>(MODEL_KEY);
  const isSupportedModel = models.some((item) => item.value === persistedModel);
  if (persistedModel && isSupportedModel) model.value = persistedModel;
  const persistedThinking = await getIdbKeyval<boolean>(THINKING_KEY);
  if (typeof persistedThinking === "boolean") thinkingEnabled.value = persistedThinking;
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
  if (chat.status === "streaming" || chat.status === "submitted") return;
  onSubmit();
}

const listTarget = useTemplateRef("list-target");
const scrollTarget = ref<HTMLElement | null>(null);

onMounted(() => {
  const main = document.getElementById("main");
  if (!(main instanceof HTMLElement)) return;
  scrollTarget.value = main;
});

const { scrollToBottom } = useChatScroll({
  listElement: listTarget,
  scrollTarget,
});

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
  await setIdbKeyval(MODEL_KEY, model.value);
  await setIdbKeyval(THINKING_KEY, thinkingEnabled.value);
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
</script>

<template>
  <ul ref="list-target" class="flex flex-col flex-1 gap-10 pt-8 pb-4 px-4">
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
  <div class="pb-4 px-4 w-auto">
    <UTextarea
      v-model="input"
      :rows="4"
      :maxrows="25"
      autoresize
      size="lg"
      class="w-full"
      placeholder="请输入要翻译的内容（单击右键快速翻译复制的内容）"
      @contextmenu="onContextMenu"
      @keydown="onInputKeydown"
    />
    <p v-if="chat.error" class="mt-2 text-sm text-error">
      {{ chat.error.message }}
    </p>
    <div class="mt-2 flex items-center gap-4">
      <USelect v-model="model" :items="models" class="w-44" />
      <div class="flex-1 flex items-center gap-4">
        <USwitch v-model="thinkingEnabled" label="深度思考" />
      </div>
      <UButton color="primary" icon="i-lucide-send" @click="onSubmitButtonClick">
        {{ submitButtonLabel }}
      </UButton>
    </div>
  </div>
</template>
