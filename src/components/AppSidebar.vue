<script setup lang="ts">
import type { NavigationMenuItem, TooltipProps } from "@nuxt/ui";
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
    {
      label: "JSON 格式化",
      icon: "i-lucide-braces",
      to: "/formatter",
      active: path === "/formatter",
    },
  ];
});

const tooltipContent: Partial<TooltipProps["content"]> = { side: "right" };
</script>

<template>
  <aside
    class="h-full w-11 border-r border-default flex flex-col items-center py-2 bg-mist-50 dark:bg-mist-950"
  >
    <div class="flex-1 flex flex-col items-center gap-2">
      <UTooltip
        v-for="item in items"
        :key="item.label"
        :text="item.label"
        :delay-duration="100"
        :content="tooltipContent"
      >
        <UButton
          :to="item.to"
          :icon="item.icon"
          :variant="item.active ? 'solid' : 'ghost'"
          :color="item.active ? 'primary' : 'neutral'"
        />
      </UTooltip>
    </div>
    <UColorModeButton variant="ghost" color="neutral" />
  </aside>
</template>
