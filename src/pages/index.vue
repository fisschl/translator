<script setup lang="ts">
import {
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  getToolName,
  DefaultChatTransport,
} from "ai";
import { Chat } from "@ai-sdk/vue";
import { isToolStreaming } from "@nuxt/ui/utils/ai";
import { ref } from "vue";

const input = ref("");

const chat = new Chat({
  transport: new DefaultChatTransport({
    api: "/api/chat/completions",
  }),
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
    <UForm class="sticky bottom-4" @submit="onSubmit">
      <UTextarea
        v-model="input"
        :rows="10"
        autoresize
        autofocus
        placeholder="请输入要翻译的内容..."
        class="w-full"
      />
      <UButton
        type="submit"
        icon="i-lucide-send"
        :loading="chat.status === 'streaming'"
        class="absolute bottom-2 right-2"
      />
    </UForm>
  </UContainer>
</template>

<style module>
.messages {
  min-height: calc(100vh - 180px);
}
</style>
