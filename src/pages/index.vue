<script setup lang="ts">
import {
  isReasoningUIPart,
  isTextUIPart,
  isToolUIPart,
  getToolName,
  DefaultChatTransport,
  streamText,
  convertToModelMessages,
} from "ai";
import { Chat } from "@ai-sdk/vue";
import { isToolStreaming, isReasoningStreaming } from "@nuxt/ui/utils/ai";
import { ref } from "vue";
import { deepseek } from "@/components/DeepSeek/provider";

const input = ref("");

const chat = new Chat({
  transport: new DefaultChatTransport({
    fetch: async (input, options) => {
      const request = new Request(input, options);
      const body = await request.json();
      const { messages } = body;
      const result = streamText({
        model: deepseek("deepseek-reasoner"),
        messages: await convertToModelMessages(messages),
      });
      return result.toUIMessageStreamResponse();
    },
  }),
});

function onSubmit() {
  chat.sendMessage({ text: input.value });

  input.value = "";
}
</script>

<template>
  <UChatMessages :messages="chat.messages" :status="chat.status">
    <template #content="{ message }">
      <template v-for="(part, index) in message.parts" :key="index">
        <UChatReasoning
          v-if="isReasoningUIPart(part)"
          :text="part.text"
          :streaming="isReasoningStreaming(message, index, chat)"
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

  <UChatPrompt v-model="input" :error="chat.error" @submit="onSubmit">
    <UChatPromptSubmit :status="chat.status" @stop="chat.stop()" @reload="chat.regenerate()" />
  </UChatPrompt>
</template>
