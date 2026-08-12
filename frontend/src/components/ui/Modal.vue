<template>
  <Teleport to="body">
    <Transition name="modal-bounce">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs font-sans"
      >
        <!-- Backdrop Click to Close -->
        <div class="fixed inset-0" @click="handleClose"></div>

        <!-- Modal Box Container -->
        <div
          class="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 space-y-5 shadow-2xl relative z-10 modal-content dark:bg-slate-900 dark:border-slate-800"
          :class="maxWidthClass"
        >
          <!-- Modal Header -->
          <div class="flex items-center justify-between">
            <h3 class="text-base font-bold text-slate-900 dark:text-white">{{ title }}</h3>
            <button
              @click="handleClose"
              class="p-1 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition dark:hover:bg-slate-800 dark:text-slate-500 dark:hover:text-slate-200"
              title="Tutup"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Modal Body Slot -->
          <div class="modal-body text-xs">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue';
import { X } from 'lucide-vue-next';

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: 'Form Modal',
  },
  size: {
    type: String,
    default: 'md', // sm, md, lg, xl
  },
});

const emit = defineEmits(['close']);

const handleClose = () => {
  emit('close');
};

const maxWidthClass = computed(() => {
  if (props.size === 'sm') return 'max-w-sm';
  if (props.size === 'lg') return 'max-w-lg';
  if (props.size === 'xl') return 'max-w-xl';
  if (props.size === '2xl') return 'max-w-2xl';
  if (props.size === '3xl') return 'max-w-3xl';
  if (props.size === '4xl') return 'max-w-4xl';
  return 'max-w-md';
});
</script>

<style scoped>
/* Vue 3 Modal Bounce Transition */
.modal-bounce-enter-active,
.modal-bounce-leave-active {
  transition: opacity 0.3s ease;
}

.modal-bounce-enter-active .modal-content {
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
}

.modal-bounce-leave-active .modal-content {
  transition: transform 0.2s ease-in, opacity 0.2s ease-in;
}

.modal-bounce-enter-from {
  opacity: 0;
}
.modal-bounce-enter-from .modal-content {
  opacity: 0;
  transform: scale(0.75) translateY(24px);
}

.modal-bounce-leave-to {
  opacity: 0;
}
.modal-bounce-leave-to .modal-content {
  opacity: 0;
  transform: scale(0.9) translateY(12px);
}
</style>
