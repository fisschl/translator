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
  ];
});

const tooltipContent: Partial<TooltipProps["content"]> = { side: "right" };
</script>

<template>
  <aside
    class="h-full w-14 border-r border-default flex flex-col items-center py-4 bg-mist-50 dark:bg-mist-950"
  >
    <div class="flex-1">
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
          size="lg"
        />
      </UTooltip>
    </div>
    <UColorModeButton variant="ghost" color="neutral" size="lg" />
  </aside>
</template>
