<template>
  <span :class="cn(badgeVariants({ variant }), className)">
    <slot />
  </span>
</template>

<script setup>
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  className: {
    type: String,
    default: '',
  },
});

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
        danger: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
        outline: 'border-slate-700 text-slate-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
</script>
