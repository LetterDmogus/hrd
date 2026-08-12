<script setup>
import { computed, ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';
import AdminCrudView from '../components/admin/AdminCrudView.vue';
const auth = useAuthStore(); const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(auth.userRole)); const recycle = ref(false); const deleted = ref([]);
const columns = [{ key: 'code', label: 'Kode' }, { key: 'name', label: 'Nama Department' }];
const fields = [{ key: 'code', label: 'Code', required: true, placeholder: 'Code Department' }, { key: 'name', label: 'Nama Department', required: true, placeholder: 'Department Name' }];
const openRecycle = async () => { try { deleted.value = (await api.get('/departments/recycle-bin')).data.data; recycle.value = true; } catch (err) { alert(err.response?.data?.message || 'Gagal memuat recycle bin'); } };
const restore = async row => { try { await api.post(`/departments/${row.id}/restore`); deleted.value = deleted.value.filter(item => item.id !== row.id); } catch (err) { alert(err.response?.data?.message || 'Gagal memulihkan department'); } };
const permanentDelete = async row => { if (!confirm(`Hapus permanen department "${row.name}"?`)) return; try { await api.delete(`/departments/${row.id}/permanent`); deleted.value = deleted.value.filter(item => item.id !== row.id); } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus permanen department'); } };
</script>
<template>
  <Transition name="page-swap" mode="out-in">
    <div v-if="!recycle" key="active">
      <div class="flex justify-end mb-3">
        <button
          v-if="canManage"
          @click="openRecycle"
          class="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Recycle Bin
        </button>
      </div>
      <AdminCrudView
        resource-label="Department"
        endpoint="/departments"
        :columns="columns"
        :fields="fields"
        :initial-form="{ code: '', name: '' }"
        search-placeholder="Cari nama, department..."
        add-label="Tambah Departemen"
        loading-text="Memuat data department..."
        empty-text="Tidak ditemukan data department."
        :can-manage="canManage"
        :page-size="5"
      />
    </div>

    <div v-else key="recycle" class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Recycle Bin Department</h2>
          <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Department yang dihapus dapat dipulihkan.</p>
        </div>
        <button
          @click="recycle = false"
          class="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          ← Kembali
        </button>
      </div>

      <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden dark:bg-slate-900 dark:border-slate-800">
        <div v-if="deleted.length" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4">Kode</th>
                <th class="py-3 px-4">Nama Department</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
              <tr v-for="row in deleted" :key="row.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                <td class="py-3 px-4 font-semibold dark:text-slate-100">{{ row.code }}</td>
                <td class="py-3 px-4 dark:text-slate-300">{{ row.name }}</td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button @click="restore(row)" class="px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 rounded-lg dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20">Pulihkan</button>
                  <button @click="permanentDelete(row)" class="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 rounded-lg dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20">Hapus Permanen</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Recycle bin kosong.</div>
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
