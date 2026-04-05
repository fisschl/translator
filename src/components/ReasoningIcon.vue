<script setup lang="ts">
import { ref } from "vue";
import { useIntervalFn } from "@vueuse/core";

const patterns = [
  [[0], [1], [2], [3], [7], [11], [15], [14], [13], [12], [8], [4], [5], [6], [10], [9]],
  [
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
  ],
  [
    [5, 6, 9, 10],
    [1, 4, 7, 8, 11, 14],
    [0, 3, 12, 15],
    [1, 4, 7, 8, 11, 14],
    [5, 6, 9, 10],
  ],
  [[0], [1, 4], [2, 5, 8], [3, 6, 9, 12], [7, 10, 13], [11, 14], [15]],
];

const activeDots = ref<Set<number>>(new Set());
const patternIndex = ref(0);
const stepIndex = ref(0);

function nextStep() {
  const pattern = patterns[patternIndex.value];
  if (!pattern) return;

  activeDots.value = new Set(pattern[stepIndex.value]);
  stepIndex.value++;

  if (stepIndex.value >= pattern.length) {
    stepIndex.value = 0;
    patternIndex.value = (patternIndex.value + 1) % patterns.length;
  }
}

useIntervalFn(nextStep, 120, { immediate: true });
</script>

<template>
  <div class="shrink-0 grid size-4 grid-cols-4 grid-rows-4 gap-0.5">
    <span
      v-for="i in 16"
      :key="i"
      class="rounded-sm bg-current transition-opacity duration-100"
      :class="activeDots.has(i - 1) ? 'opacity-100' : 'opacity-20'"
    />
  </div>
</template>
