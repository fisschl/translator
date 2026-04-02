<script setup lang="ts">
defineProps<{
  msg: string;
}>();
</script>

<template>
  <div :class="$style.greetings">
    <h1 :class="$style.green">{{ msg }}</h1>
    <h3 :class="$style.subtitle">
      You've successfully created a project with
      <a href="https://vite.dev/" target="_blank" rel="noopener">Vite</a> +
      <a href="https://vuejs.org/" target="_blank" rel="noopener">Vue 3</a>. What's next?
    </h3>
  </div>
</template>

<style module>
.green {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

.subtitle {
  font-size: 1.2rem;
}

.greetings .green,
.greetings .subtitle {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings .green,
  .greetings .subtitle {
    text-align: left;
  }
}
</style>
