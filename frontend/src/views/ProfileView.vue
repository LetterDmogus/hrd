<template>
  <div class="w-full space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-xl font-bold text-slate-900">Edit Profil</h2>
      <p class="text-xs text-slate-500 mt-1">Perbarui informasi akun dan data pribadi Anda.</p>
    </div>

    <!-- Alert -->
    <div v-if="alertMsg" :class="alertType === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'"
      class="flex items-center gap-3 px-4 py-3 border rounded-xl text-xs font-medium">
      <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path v-if="alertType === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
      {{ alertMsg }}
    </div>

    <div v-if="loading" class="p-8 text-center text-slate-400 text-xs">
      Memuat profil...
    </div>

    <form v-else @submit.prevent="saveProfile" class="space-y-5">
      <!-- Akun Section -->
      <div class="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-200">
          <div class="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Informasi Akun</h3>
            <p class="text-[11px] text-slate-400">Email dan kredensial login</p>
          </div>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold text-slate-600 mb-1.5">Email Login</label>
            <input v-model="profile.email" type="email" disabled
              class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium select-none" />
            <p class="text-[11px] text-slate-400 mt-1">Email bersifat unik dan tidak dapat diubah.</p>
          </div>

          <div class="flex items-center gap-2 px-3 py-2.5 bg-slate-100 rounded-xl">
            <svg class="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span class="text-[11px] text-slate-500">Role: <strong class="text-indigo-600 uppercase">{{ profile.roleName || '-' }}</strong> · Role hanya dapat diubah oleh admin.</span>
          </div>
        </div>
      </div>

      <!-- Data Pribadi (jika terhubung ke karyawan) -->
      <div v-if="profile.employeeId" class="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-xs">
        <div class="flex items-center gap-2 pb-3 border-b border-slate-200">
          <div class="w-8 h-8 rounded-xl bg-violet-600/10 text-violet-600 flex items-center justify-center">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Data Pribadi</h3>
            <p class="text-[11px] text-slate-400">Informasi yang terhubung ke data karyawan Anda</p>
          </div>
        </div>

        <div class="space-y-3 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1.5">Nama Depan</label>
              <input v-model="profile.firstName" required
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-400 transition" />
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1.5">Nama Belakang</label>
              <input v-model="profile.lastName"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-400 transition" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-600 mb-1.5">Nomor Telepon</label>
            <input v-model="profile.phone" placeholder="+62..."
              class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-400 transition" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1.5">Jenis Kelamin</label>
              <select v-model="profile.gender"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-400 transition">
                <option value="">Pilih</option>
                <option value="male">Laki-laki</option>
                <option value="female">Perempuan</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1.5">Tanggal Lahir</label>
              <input v-model="profile.birthDate" type="date"
                class="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-400 transition" />
            </div>
          </div>

          <p class="text-[11px] text-slate-400 italic">Department, jabatan, dan gaji hanya dapat diubah oleh admin.</p>
        </div>
      </div>

      <!-- Info: Akun tidak terhubung ke karyawan -->
      <div v-else class="flex items-start gap-3 px-4 py-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <svg class="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Akun ini belum terhubung ke data karyawan. Hanya email yang dapat diubah. Hubungi admin untuk menautkan akun ke data karyawan.</span>
      </div>

      <!-- Save Button -->
      <div class="flex items-center justify-end gap-3">
        <button type="button" @click="router.back()"
          class="px-4 py-2 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition">
          Batal
        </button>
        <button type="submit" :disabled="saving"
          class="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-200 dark:shadow-black/40 transition flex items-center gap-2 disabled:opacity-60">
          <svg v-if="saving" class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(true);
const saving = ref(false);
const alertMsg = ref('');
const alertType = ref('success');

const profile = ref({
  email: '',
  roleName: '',
  employeeId: null,
  firstName: '',
  lastName: '',
  phone: '',
  gender: '',
  birthDate: '',
});

const fetchProfile = async () => {
  try {
    const data = (await api.get('/auth/profile')).data.data;
    profile.value = {
      email: data.email || authStore.user?.email || '',
      roleName: data.roleName || authStore.userRole || '',
      employeeId: data.employeeId || null,
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      phone: data.phone || '',
      gender: data.gender || '',
      birthDate: data.birthDate || '',
    };
  } catch (err) {
    showAlert('Gagal memuat profil', 'error');
  } finally {
    loading.value = false;
  }
};

const saveProfile = async () => {
  saving.value = true;
  alertMsg.value = '';
  try {
    await api.put('/auth/profile', profile.value);
    if (authStore.user) {
      authStore.user.email = profile.value.email;
      localStorage.setItem('knowhr_user', JSON.stringify(authStore.user));
    }
    showAlert('Profil berhasil diperbarui!', 'success');
  } catch (err) {
    showAlert(err.response?.data?.message || 'Gagal menyimpan profil', 'error');
  } finally {
    saving.value = false;
  }
};

const showAlert = (msg, type) => {
  alertMsg.value = msg;
  alertType.value = type;
  setTimeout(() => { alertMsg.value = ''; }, 4000);
};

onMounted(fetchProfile);
</script>
