<script setup lang="ts">
import MonacoEditor from "@/components/MonacoEditor/MonacoEditor.vue";

const sampleJson = `{
  "name": "translator",
  "version": "1.0.0",
  "features": ["translate", "format", "preview"],
  "editor": {
    "language": "json",
    "theme": "vs",
    "readOnly": false
  }
}`;
</script>

<template>
  <section class="flex flex-col flex-1 min-h-0">
    <MonacoEditor language="json" :default-code="sampleJson" class="flex-1 min-h-0" />
  </section>
</template>
