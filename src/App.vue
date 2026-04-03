<script setup lang="ts">
import { zh_cn } from "@nuxt/ui/locale";
import { RouterView } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
</script>

<template>
  <UApp :locale="zh_cn">
    <AppHeader />
    <UMain>
      <RouterView />
    </UMain>
  </UApp>
</template>
