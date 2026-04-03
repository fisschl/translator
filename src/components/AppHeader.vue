<script setup lang="ts">
import type { NavigationMenuItem } from "@nuxt/ui";
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();

const items = computed<NavigationMenuItem[]>(() => {
  const { path } = route;
  return [
    {
      label: "文本翻译",
      icon: "i-lucide-book-open",
      to: "/",
      active: path === "/",
    },
  ];
});
</script>

<template>
  <UHeader>
    <template #title>
      <span class="flex items-center gap-2 text-base">
        <UIcon name="i-lucide-earth" class="size-5" />
        翻译
      </span>
    </template>

    <UNavigationMenu :items="items" />

    <template #right>
      <UColorModeButton />
    </template>
  </UHeader>
</template>
