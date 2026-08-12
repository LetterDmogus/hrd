<script setup>
import { computed, onMounted, ref } from 'vue';
import { Key } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';
import AdminCrudView from '../components/admin/AdminCrudView.vue';

const auth = useAuthStore();
const employees = ref([]);
const crud = ref(null);
const recycle = ref(false);
const deleted = ref([]);

const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(auth.userRole));

const employeeOptions = computed(() => [
  { value: '', label: 'Non-Pegawai / Tidak Dihubungkan' },
  ...employees.value.map(emp => ({ value: emp.id, label: `${emp.employeeCode} - ${emp.firstName} ${emp.lastName || ''}` })),
]);

const columns = [
  { key: 'name', label: 'Nama User' },
  { key: 'employeeName', label: 'Relasi Karyawan' },
  { key: 'email', label: 'Email' },
  { key: 'roleName', label: 'Role System' },
  { key: 'isActive', label: 'Status', type: 'status', format: value => value ? 'Aktif' : 'Tidak Aktif', statusClass: row => row.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30' },
];

const fields = computed(() => [
  { key: 'name', label: 'Nama User', required: true, placeholder: 'Masukkan Nama' },
  { key: 'email', label: 'Email Log In', type: 'email', required: true, placeholder: 'email@company.com' },
  { key: 'employeeId', label: 'Pilih Karyawan (Opsional)', type: 'select', options: employeeOptions.value },
  { key: 'roleName', label: 'Role Sistem', type: 'select', required: true, options: [
    { value: '', label: 'Pilih Role' }, { value: 'superadmin', label: 'Super Admin' }, { value: 'admin_ti', label: 'Admin TI' },
    { value: 'hr', label: 'HR Manager / Staff' }, { value: 'manager', label: 'Line Manager' }, { value: 'employee', label: 'Karyawan Biasa' },
  ] },
  { key: 'isActive', label: 'Akun Aktif', type: 'checkbox', checkboxLabel: 'Akun Aktif (Dapat Log In)' },
]);

const resetPassword = async user => {
  if (!confirm(`Reset password user ${user.name} menjadi "password123"?`)) return;
  try {
    await api.post(`/users/${user.id}/reset-password`);
    alert('Password berhasil di-reset menjadi password123');
    crud.value?.reload();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mereset password user');
  }
};

const openRecycle = async () => {
  try {
    deleted.value = (await api.get('/users/recycle-bin')).data.data;
    recycle.value = true;
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memuat recycle bin user');
  }
};

const restore = async row => {
  try {
    await api.post(`/users/${row.id}/restore`);
    deleted.value = deleted.value.filter(item => item.id !== row.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memulihkan user');
  }
};

const permanentDelete = async row => {
  if (!confirm(`Hapus permanen user "${row.name}"?`)) return;
  try {
    await api.delete(`/users/${row.id}/permanent`);
    deleted.value = deleted.value.filter(item => item.id !== row.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus permanen user');
  }
};

onMounted(async () => {
  try { employees.value = (await api.get('/employees')).data.data; }
  catch (err) { console.error('Error fetching employees list:', err); }
});
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
        ref="crud"
        resource-label="User"
        endpoint="/users"
        :columns="columns"
        :fields="fields"
        :initial-form="{ name: '', email: '', employeeId: '', roleName: 'hr', isActive: true }"
        search-placeholder="Cari nama, email..."
        add-label="Tambah User"
        loading-text="Memuat data user..."
        empty-text="Tidak ditemukan data user."
        :can-manage="canManage"
      >
        <template #row-actions="{ row }">
          <button v-if="canManage" @click="resetPassword(row)" class="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition dark:text-slate-500 dark:hover:text-amber-400 dark:hover:bg-amber-500/10" title="Reset Password (password123)">
            <Key class="w-4 h-4" />
          </button>
        </template>
      </AdminCrudView>
    </div>

    <div v-else key="recycle" class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Recycle Bin User</h2>
          <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">User yang dihapus dapat dipulihkan.</p>
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
                <th class="py-3 px-4">Nama User</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4">Role System</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
              <tr v-for="row in deleted" :key="row.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{{ row.name }}</td>
                <td class="py-3 px-4 text-slate-600 dark:text-slate-400">{{ row.email }}</td>
                <td class="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400">{{ row.roleName || '-' }}</td>
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
