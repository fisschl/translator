<script setup lang="ts">
import { zh_cn } from "@nuxt/ui/locale";
import { RouterView } from "vue-router";
import AppSidebar from "@/components/AppSidebar.vue";
</script>

<template>
  <UApp :locale="zh_cn">
    <AppSidebar />
    <UMain id="main" class="flex-1 min-w-0 overflow-auto flex flex-col">
      <RouterView />
    </UMain>
  </UApp>
</template>
