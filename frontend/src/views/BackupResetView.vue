<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="border-b border-slate-200/80 pb-4">
      <h2 class="text-xl font-bold text-slate-900 tracking-tight">System Backup & Database Reset</h2>
      <p class="text-xs text-slate-500 mt-1">Ekspor salinan cadangan (*backup*) data sistem dan pembersihan data operasional (*reset*).</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- CARD 1: BACKUP DATABASE -->
      <div class="p-6 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-2xs">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Download class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Backup Data Sistem</h3>
            <p class="text-xs text-slate-500">Unduh seluruh master data, karyawan, absensi, dan riwayat scan.</p>
          </div>
        </div>

        <div class="p-3 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
          <span class="font-bold block">Format File: JSON Backup Package</span>
          <p class="text-[11px] text-indigo-700">File JSON yang diunduh mencakup seluruh struktur tabel database HRD Analytic secara lengkap.</p>
        </div>

        <button
          @click="downloadBackup"
          :disabled="downloading"
          class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
        >
          <Database class="w-4 h-4" />
          <span>{{ downloading ? 'Mengekspor Backup...' : 'Unduh Backup Database (.json)' }}</span>
        </button>
      </div>

      <!-- CARD 2: RESET DATABASE -->
      <div class="p-6 bg-white border border-rose-200 rounded-2xl space-y-4 shadow-2xs dark:bg-slate-900 dark:border-rose-950">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 dark:bg-rose-950/50 dark:border-rose-900">
            <AlertTriangle class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Reset Data Operasional</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Bersihkan data transaksi absensi, evaluasi KPI, dan hasil scan AI.</p>
          </div>
        </div>

        <div class="p-3 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-900 space-y-1 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-300">
          <span class="font-bold block text-rose-700 dark:text-rose-400">Peringatan Tindakan Berbahaya:</span>
          <p class="text-[11px] text-rose-600 dark:text-rose-400">Tindakan ini akan menghapus data operasional transaksi. Master karyawan dan akun user utama akan tetap aman.</p>
        </div>

        <button
          @click="showResetModal = true"
          class="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
        >
          <RefreshCw class="w-4 h-4" />
          <span>Reset Data Operasional</span>
        </button>
      </div>
    </div>

    <!-- CARD 3: MAIN APP & COMPANY SETTINGS -->
    <div class="p-6 bg-white border border-slate-200 rounded-2xl space-y-5 shadow-2xs dark:bg-slate-900 dark:border-slate-800">
      <div class="flex items-center gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
        <div class="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 dark:bg-indigo-950/50 dark:border-indigo-900 dark:text-indigo-400">
          <Settings class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-slate-900 dark:text-white">Pengaturan Utama Perusahaan & Aplikasi</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">Informasi kontak ini akan ditampilkan pada Landing Page (Contact Us) & Footer sistem.</p>
        </div>
      </div>

      <form @submit.prevent="saveSettings" class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div class="space-y-1">
          <label class="font-semibold text-slate-700 dark:text-slate-300">Nama Aplikasi</label>
          <input v-model="settingsForm.appName" type="text" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>

        <div class="space-y-1">
          <label class="font-semibold text-slate-700 dark:text-slate-300">Nama Perusahaan</label>
          <input v-model="settingsForm.companyName" type="text" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>

        <div class="space-y-1">
          <label class="font-semibold text-slate-700 dark:text-slate-300">Nomor Telepon / WhatsApp</label>
          <input v-model="settingsForm.companyPhone" type="text" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>

        <div class="space-y-1">
          <label class="font-semibold text-slate-700 dark:text-slate-300">Email Resmi Perusahaan</label>
          <input v-model="settingsForm.companyEmail" type="email" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>

        <div class="space-y-1 md:col-span-2">
          <label class="font-semibold text-slate-700 dark:text-slate-300">Alamat Perusahaan</label>
          <textarea v-model="settingsForm.companyAddress" rows="2" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white"></textarea>
        </div>

        <div class="space-y-1 md:col-span-2">
          <label class="font-semibold text-slate-700 dark:text-slate-300">Teks Hak Cipta (Copyright Footer)</label>
          <input v-model="settingsForm.copyrightText" type="text" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
        </div>

        <div class="md:col-span-2 flex justify-end pt-2">
          <button type="submit" :disabled="savingSettings" class="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50">
            {{ savingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Utama' }}
          </button>
        </div>
      </form>
    </div>

    <!-- MODAL KONFIRMASI RESET -->
    <Modal :open="showResetModal" title="Konfirmasi Reset Data Operasional" @close="showResetModal = false">
      <form @submit.prevent="submitReset" class="space-y-4 text-xs font-sans">
        <div class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1">
          <span class="font-bold block">Apakah Anda benar-benar yakin?</span>
          <p class="text-[11px] text-rose-700">
            Seluruh data riwayat absensi, evaluasi KPI, penugasan pelatihan, serta hasil pemindaian AI akan **dihapus secara permanen**.
          </p>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1">
            Ketik kata frasa <span class="font-mono text-rose-600 uppercase font-bold">RESET DATABASE</span> untuk melanjutkan:
          </label>
          <input
            v-model="confirmInput"
            type="text"
            required
            placeholder="RESET DATABASE"
            class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono uppercase font-bold focus:border-rose-500 focus:outline-none"
          />
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button type="button" @click="showResetModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold">Batal</button>
          <button
            type="submit"
            :disabled="resetting || confirmInput !== 'RESET DATABASE'"
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl font-semibold transition"
          >
            {{ resetting ? 'Memproses Reset...' : 'Ya, Reset Data Sekarang' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../api/axios';
import Modal from '../components/ui/Modal.vue';
import {
  Download,
  Database,
  AlertTriangle,
  RefreshCw,
  Settings
} from 'lucide-vue-next';

const downloading = ref(false);
const showResetModal = ref(false);
const confirmInput = ref('');
const resetting = ref(false);
const savingSettings = ref(false);

const settingsForm = ref({
  appName: 'KnowHR',
  companyName: 'PT KnowHR Platform Indonesia',
  companyAddress: 'Jl. Jendral Sudirman No. 45, Jakarta Selatan, 12190',
  companyPhone: '+62 21 555 1234',
  companyEmail: 'contact@knowhr.id',
  copyrightText: '© 2026 KnowHR Platform. All rights reserved.',
});

const fetchSettings = async () => {
  try {
    const res = await api.get('/system/settings');
    if (res.data.data) {
      settingsForm.value = { ...res.data.data };
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
};

const saveSettings = async () => {
  savingSettings.value = true;
  try {
    const res = await api.put('/system/settings', settingsForm.value);
    alert('Berhasil memperbarui Pengaturan Utama Perusahaan & Aplikasi!');
    if (res.data.data) {
      settingsForm.value = { ...res.data.data };
    }
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan pengaturan utama.');
  } finally {
    savingSettings.value = false;
  }
};

onMounted(fetchSettings);

const downloadBackup = async () => {
  downloading.value = true;
  try {
    const response = await api.get('/system/backup', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `backup_hrd_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    alert('Gagal mengunduh backup database');
  } finally {
    downloading.value = false;
  }
};

const submitReset = async () => {
  if (confirmInput.value !== 'RESET DATABASE') return;
  resetting.value = true;
  try {
    const res = await api.post('/system/reset', { confirmText: confirmInput.value });
    alert(res.data.message || 'Berhasil mereset data operasional database.');
    showResetModal.value = false;
    confirmInput.value = '';
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mereset database');
  } finally {
    resetting.value = false;
  }
};
</script>
