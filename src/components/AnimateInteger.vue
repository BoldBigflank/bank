<template>{{ displayNumber }}</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    default: 0,
  },
  speed: {
    // smaller is faster
    type: Number,
    default: 5,
  },
  ariaLabel: {
    type: String,
    default: undefined
  }
});

const displayNumber = ref(props.value);
let interval:number|undefined = undefined;

watch(
  () => props.value,
  (newVal) => {
    clearInterval(interval);

    if (newVal === displayNumber.value) {
      return;
    }

    interval = setInterval(() => {
      if (Math.floor(displayNumber.value) !== Math.floor(newVal)) {
        var change = (newVal - displayNumber.value) / props.speed;
        change = change >= 0 ? Math.ceil(change) : Math.floor(change);
        displayNumber.value = displayNumber.value + change;
      } else {
        displayNumber.value = newVal;
        clearInterval(interval);
      }
    }, 20);
  }
);
</script>