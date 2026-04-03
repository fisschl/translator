<script setup lang="ts">
import { RouterView } from "vue-router";
import AppHeader from "@/components/AppHeader.vue";
import { zh_cn } from "@nuxt/ui/locale";
</script>

<template>
  <UApp :locale="zh_cn">
    <AppHeader />
    <UMain>
      <RouterView />
    </UMain>
  </UApp>
</template>

<style module></style>
