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
import { get, set } from "idb-keyval";
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
    await set(HISTORY_KEY, JSON.stringify(messages.slice(-MAX_HISTORY)));
  },
});

const readHistory = async () => {
  const raw = await get<string>(HISTORY_KEY);
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
};

onMounted(async () => {
  const history = await readHistory();
  if (history?.length) chat.messages = history;
});

function onSubmit() {
  const userInput = input.value.trim();
  if (!userInput) return;
  chat.sendMessage({ text: `请帮我翻译以下内容：\n\n${userInput}` });
  input.value = "";
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
    <UForm v-if="chat.status === 'ready'" class="sticky bottom-4" @submit="onSubmit">
      <UTextarea
        v-model="input"
        :rows="10"
        autoresize
        autofocus
        placeholder="请输入要翻译的内容..."
        class="w-full"
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
