<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';
import AdminCrudView from '../components/admin/AdminCrudView.vue';

const auth = useAuthStore();
const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(auth.userRole));
const recycle = ref(false);
const deleted = ref([]);
const departments = ref([]);

const columns = [
  { key: 'title', label: 'Jabatan' },
  { key: 'department', label: 'Divisi' },
  { key: 'level', label: 'Level' }
];

const departmentOptions = computed(() => [
  { value: '', label: 'Pilih Divisi / Departemen' },
  ...departments.value.map(d => ({ value: d.id, label: d.name }))
]);

const fields = computed(() => [
  { key: 'title', label: 'Jabatan', required: true, placeholder: 'Developer' },
  { key: 'departmentId', label: 'Divisi / Departemen', type: 'select', required: true, options: departmentOptions.value },
  { key: 'level', label: 'Level', required: true, placeholder: 'Senior / Junior / Manager' }
]);

const fetchDepartments = async () => {
  try {
    const res = await api.get('/departments');
    departments.value = res.data.data;
  } catch (err) {
    console.error('Gagal memuat departemen:', err);
  }
};

const openRecycle = async () => {
  try {
    deleted.value = (await api.get('/positions/recycle-bin')).data.data;
    recycle.value = true;
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memuat recycle bin jabatan');
  }
};

const restore = async row => {
  try {
    await api.post(`/positions/${row.id}/restore`);
    deleted.value = deleted.value.filter(item => item.id !== row.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memulihkan jabatan');
  }
};

const permanentDelete = async row => {
  if (!confirm(`Hapus permanen jabatan "${row.title}"?`)) return;
  try {
    await api.delete(`/positions/${row.id}/permanent`);
    deleted.value = deleted.value.filter(item => item.id !== row.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus permanen jabatan');
  }
};

onMounted(fetchDepartments);
</script>

<template>
  <Transition name="page-swap" mode="out-in">
    <div v-if="!recycle" key="active">
      <div class="flex justify-end mb-3">
        <button
          v-if="canManage"
          @click="openRecycle"
          class="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Recycle Bin
        </button>
      </div>
      <AdminCrudView
        resource-label="Jabatan"
        endpoint="/positions"
        :columns="columns"
        :fields="fields"
        :initial-form="{ title: '', departmentId: '', level: '' }"
        search-placeholder="Cari nama, jabatan..."
        add-label="Tambah Jabatan"
        loading-text="Memuat data jabatan..."
        empty-text="Tidak ditemukan data jabatan."
        :can-manage="canManage"
      />
    </div>

    <div v-else key="recycle" class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Recycle Bin Jabatan</h2>
          <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Jabatan yang dihapus dapat dipulihkan.</p>
        </div>
        <button
          @click="recycle = false"
          class="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          ← Kembali
        </button>
      </div>

      <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div v-if="deleted.length" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4">Jabatan</th>
                <th class="py-3 px-4">Divisi</th>
                <th class="py-3 px-4">Level</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
              <tr v-for="row in deleted" :key="row.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{{ row.title }}</td>
                <td class="py-3 px-4 dark:text-slate-400">{{ row.department || '-' }}</td>
                <td class="py-3 px-4 dark:text-slate-400">{{ row.level || '-' }}</td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button @click="restore(row)" class="px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20">
                    Pulihkan
                  </button>
                  <button @click="permanentDelete(row)" class="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20">
                    Hapus Permanen
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">
          Recycle bin kosong.
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.page-swap-enter-active,
.page-swap-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.page-swap-enter-from {
  opacity: 0;
  transform: translateX(18px);
}
.page-swap-leave-to {
  opacity: 0;
  transform: translateX(-18px);
}
</style>
