<template>
  <div class="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden">
    <!-- Ambient Background Glows -->
    <div class="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md space-y-8 relative z-10 animate-bounce-in">
      <!-- Logo & Title Header -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">KnowHR Analytics</h1>
        <p class="text-sm text-slate-600">Sistem Analitik SDM Berbasis AI & Prediksi Turnover</p>
      </div>

      <!-- Login Glassmorphic Card -->
      <div class="bg-slate-100/40 backdrop-blur-xl rounded-2xl p-8 shadow-2xl space-y-6 border border-slate-200/60">
        <!-- Error Alert -->
        <div v-if="authStore.error" class="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm flex items-center gap-3">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ authStore.error }}</span>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-5">
          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="nama@company.com"
              class="w-full px-4 py-2 bg-slate-200/60 border border-slate-200 rounded-xl text-black placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <input
              v-model="password"
              type="password"
              required
              placeholder="••••••••"
              class="w-full px-4 py-2 bg-slate-200/60 border border-slate-200 rounded-xl text-black placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            />
          </div>

          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/30 dark:shadow-black/40 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="authStore.loading" class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ authStore.loading ? 'Signing in...' : 'Sign In to Dashboard' }}</span>
          </button>
        </form>

        <!-- Quick Demo Presets -->
        <div class="pt-4 border-t border-slate-800">
          <p class="text-xs text-slate-500 mb-3 font-medium">Quick Demo Credentials (Seed Accounts):</p>
          <div class="grid grid-cols-2 gap-2">
            <button
              @click="quickLogin('hr@knowhr.com', 'password123')"
              type="button"
              class="text-left p-2.5 bg-slate-200/60 hover:bg-slate-300/60 border border-slate-200 rounded-lg text-xs text-slate-900 transition"
            >
              <span class="font-semibold block text-indigo-400">HR User</span>
              hr@knowhr.com
            </button>
            <button
              @click="quickLogin('superadmin@knowhr.com', 'password123')"
              type="button"
              class="text-left p-2.5 bg-slate-200/60 hover:bg-slate-300/60 border border-slate-200 rounded-lg text-xs text-slate-900 transition"
            >
              <span class="font-semibold block text-violet-400">SuperAdmin</span>
              superadmin@knowhr.com
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('hr@knowhr.com');
const password = ref('password123');

const handleLogin = async () => {
  const success = await authStore.login(email.value, password.value);
  if (success) {
    router.push('/dashboard');
  }
};

const quickLogin = (presetEmail, presetPassword) => {
  email.value = presetEmail;
  password.value = presetPassword;
  handleLogin();
};
</script>

<style scoped>
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.85) translateY(30px);
  }
  60% {
    opacity: 1;
    transform: scale(1.03) translateY(-8px);
  }
  80% {
    transform: scale(0.98) translateY(2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-bounce-in {
  animation: bounceIn 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
