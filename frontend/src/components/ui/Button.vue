<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="cn(buttonVariants({ variant, size }), className)"
    v-bind="$attrs"
  >
    <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
    </svg>
    <slot />
  </button>
</template>

<script setup>
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
  },
  size: {
    type: String,
    default: 'default',
  },
  type: {
    type: String,
    default: 'button',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  className: {
    type: String,
    default: '',
  },
});

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 dark:shadow-black/40',
        destructive: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 dark:shadow-black/40',
        outline: 'border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-white',
        ghost: 'hover:bg-slate-800 hover:text-white text-slate-400',
      },
      size: {
        default: 'h-10 px-4 py-2 text-sm',
        sm: 'h-8 px-3 text-xs rounded-lg',
        lg: 'h-12 px-6 text-base rounded-2xl',
        icon: 'h-9 w-9 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
</script>
