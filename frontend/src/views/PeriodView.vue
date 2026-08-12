<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';
import AdminCrudView from '../components/admin/AdminCrudView.vue';

const auth = useAuthStore();
const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(auth.userRole));
const recycle = ref(false);
const deleted = ref([]);

const columns = [
  { key: 'id', label: 'No' },
  { key: 'periodCode', label: 'Kode Periode' },
  { key: 'name', label: 'Nama Periode' },
  { key: 'startDate', label: 'Tanggal Mulai' },
  { key: 'endDate', label: 'Tanggal Selesai' },
  { key: 'status', label: 'Status' }
];

const statusOptions = [
  { value: 'active', label: 'Aktif (Active)' },
  { value: 'closed', label: 'Ditutup (Closed)' },
  { value: 'draft', label: 'Draft' }
];

const fields = [
  { key: 'periodCode', label: 'Kode Periode', required: true, placeholder: 'Misal: 2026-Q1 / 2026-M08' },
  { key: 'name', label: 'Nama Periode', required: true, placeholder: 'Misal: Kuartal I 2026 (Jan - Mar)' },
  { key: 'startDate', label: 'Tanggal Mulai', type: 'date', required: true },
  { key: 'endDate', label: 'Tanggal Selesai', type: 'date', required: true },
  { key: 'status', label: 'Status Periode', type: 'select', required: true, options: statusOptions }
];

const openRecycle = async () => {
  try {
    deleted.value = (await api.get('/analytics/periods/recycle-bin')).data.data;
    recycle.value = true;
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memuat recycle bin periode');
  }
};

const restore = async row => {
  try {
    await api.post(`/analytics/periods/${row.id}/restore`);
    deleted.value = deleted.value.filter(item => item.id !== row.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memulihkan periode');
  }
};

const permanentDelete = async row => {
  if (!confirm(`Hapus permanen periode "${row.name}"?`)) return;
  try {
    await api.delete(`/analytics/periods/${row.id}/permanent`);
    deleted.value = deleted.value.filter(item => item.id !== row.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus permanen periode');
  }
};
</script>

<template>
  <Transition name="page-swap" mode="out-in">
    <div v-if="!recycle" key="active">
      <div class="flex justify-end mb-3">
        <button
          v-if="canManage"
          @click="openRecycle"
          class="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
        >
          Recycle Bin Periode
        </button>
      </div>
      <AdminCrudView
        resource-label="Periode Evaluasi"
        endpoint="/analytics/periods"
        :columns="columns"
        :fields="fields"
        :initial-form="{ periodCode: '', name: '', startDate: '', endDate: '', status: 'active' }"
        search-placeholder="Cari kode periode, nama..."
        add-label="Tambah Periode Evaluasi"
        loading-text="Memuat data periode evaluasi..."
        empty-text="Tidak ditemukan data periode evaluasi."
        :can-manage="canManage"
      />
    </div>

    <div v-else key="recycle" class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900">Recycle Bin Periode Evaluasi</h2>
          <p class="text-xs text-slate-500 mt-1">Periode yang dihapus dapat dipulihkan kembali.</p>
        </div>
        <button
          @click="recycle = false"
          class="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition"
        >
          Tutup Recycle Bin
        </button>
      </div>

      <div v-if="deleted.length > 0" class="divide-y divide-slate-200 border rounded-2xl bg-white">
        <div v-for="row in deleted" :key="row.id" class="p-3.5 flex items-center justify-between text-xs">
          <div>
            <span class="font-bold text-slate-900 block">{{ row.periodCode }} - {{ row.name }}</span>
            <span class="text-slate-400 font-mono text-[11px]">{{ row.startDate }} s/d {{ row.endDate }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button @click="restore(row)" class="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200">Pulihkan</button>
            <button @click="permanentDelete(row)" class="px-3 py-1.5 bg-rose-50 text-rose-700 font-bold rounded-xl border border-rose-200">Hapus Permanen</button>
          </div>
        </div>
      </div>
      <div v-else class="text-slate-400 text-center py-8 text-xs">Recycle bin periode kosong.</div>
    </div>
  </Transition>
</template>
