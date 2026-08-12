<template>
  <div :class="cn('bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl', className)">
    <slot />
  </div>
</template>

<script setup>
import { cn } from '../../lib/utils';

defineProps({
  className: {
    type: String,
    default: '',
  },
});
</script>
