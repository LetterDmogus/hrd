<template>
  <Transition name="page-swap" mode="out-in">
    <div v-if="!recycle" key="active" class="space-y-5">
      <!-- Header Action & Search Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div class="flex flex-1 items-center gap-2 max-w-xl">
          <!-- Search Input -->
          <div class="relative flex-1">
            <Search class="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama, kode, atau email..."
              class="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
            />
          </div>

          <!-- Department Filter Select -->
          <select
            v-model="selectedDepartment"
            class="py-2 px-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 font-medium focus:outline-none focus:border-indigo-500 focus:bg-white transition shrink-0 max-w-[180px] dark:bg-slate-800/50 dark:border-slate-800 dark:text-slate-300 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
          >
            <option value="">Semua Departemen</option>
            <option v-for="dept in departmentsList" :key="dept.id" :value="dept.name">
              {{ dept.name }}
            </option>
          </select>
        </div>

        <div class="flex items-center gap-2">
          <!-- Recycle Bin Button -->
          <button
            v-if="canManage"
            @click="openRecycle"
            class="py-2 px-3 border border-slate-200 text-slate-600 rounded-2xl text-xs font-semibold hover:bg-slate-50 transition dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            Recycle Bin
          </button>

          <!-- Add Employee Button -->
          <button
            v-if="canManage"
            @click="openAddModal"
            class="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-2xl shadow-sm shadow-indigo-200 dark:shadow-black/40 transition flex items-center justify-center gap-1.5"
          >
            <Plus class="w-4 h-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>

      <!-- Employee Table Container -->
      <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div v-if="loading" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">
          Memuat data karyawan...
        </div>

        <div v-else-if="filteredEmployees.length > 0" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4">Kode</th>
                <th class="py-3 px-4">Nama Lengkap</th>
                <th class="py-3 px-4">Divisi & Jabatan</th>
                <th class="py-3 px-4">Gaji</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
              <tr v-for="emp in filteredEmployees" :key="emp.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                <td class="py-3 px-4 font-mono text-[11px] text-indigo-600 font-bold dark:text-indigo-400">{{ emp.employeeCode }}</td>
                <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  {{ emp.firstName }} {{ emp.lastName || '' }}
                  <span class="block text-[11px] font-normal text-slate-400 dark:text-slate-500">{{ emp.email }}</span>
                </td>
                <td class="py-3 px-4">
                  <span class="text-slate-800 block font-medium dark:text-slate-200">{{ emp.departmentName || '-' }}</span>
                  <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ emp.positionTitle || '-' }}</span>
                </td>
                <td class="py-3 px-4 font-mono text-slate-700 dark:text-slate-300">
                  Rp {{ parseInt(emp.currentSalary || 0).toLocaleString('id-ID') }}
                </td>
                <td class="py-3 px-4">
                  <span
                    class="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border"
                    :class="emp.employmentStatus === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30'"
                  >
                    {{ emp.employmentStatus }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button
                    v-if="canManage"
                    @click="openEditModal(emp)"
                    class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
                    title="Edit"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>

                  <button
                    v-if="canManage"
                    @click="confirmDelete(emp)"
                    class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10"
                    title="Hapus"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">
          Tidak ditemukan data karyawan.
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.totalPages > 1" class="flex justify-center items-center gap-2 mt-4">
        <button
          v-if="pagination.hasPreviousPage"
          @click="handlePageChange(pagination.page - 1)"
          class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          <ChevronLeft class="w-6 h-6" />
        </button>

        <button
          v-for="page in pagination.totalPages"
          :key="page"
          @click="handlePageChange(page)"
          class="font-medium w-8 h-8 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          {{ page }}
        </button>

        <button
          v-if="pagination.hasNextPage"
          @click="handlePageChange(pagination.page + 1)"
          class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
        >
          <ChevronRight class="w-6 h-6" />
        </button>
      </div>

      <!-- Reusable Modal Form (Tambah / Edit Karyawan) -->
      <Modal
        :open="showModal"
        :title="isEditMode ? 'Edit Karyawan' : 'Tambah Karyawan'"
        @close="showModal = false"
      >
        <form @submit.prevent="saveEmployee" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Kode Karyawan</label>
              <input v-model="form.employeeCode" required placeholder="EMP004" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Email</label>
              <input v-model="form.email" type="email" required placeholder="email@company.com" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Nama Depan</label>
              <input v-model="form.firstName" required placeholder="Budi" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Nama Belakang</label>
              <input v-model="form.lastName" placeholder="Santoso" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Divisi / Departemen</label>
              <select v-model="form.departmentId" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                <option value="" disabled>Pilih Departemen</option>
                <option v-for="dept in departmentsList" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Jabatan</label>
              <select v-model="form.positionId" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                <option value="" disabled>Pilih Jabatan</option>
                <option v-for="pos in positionsList" :key="pos.id" :value="pos.id">
                  {{ pos.title }} {{ pos.department ? `(${pos.department})` : '' }}
                </option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Jenis Kelamin</label>
              <select v-model="form.gender" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                <option value="male">Laki-laki (Male)</option>
                <option value="female">Perempuan (Female)</option>
              </select>
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Status Pernikahan</label>
              <select v-model="form.maritalStatus" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
                <option value="Single">Single (Belum Menikah)</option>
                <option value="Married">Married (Sudah Menikah)</option>
                <option value="Divorced">Divorced (Cerai)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Lahir</label>
              <input v-model="form.birthDate" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            </div>
            <div>
              <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Masuk (Hire Date)</label>
              <input v-model="form.hireDate" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
            </div>
          </div>

          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Gaji Saat Ini (Rp)</label>
            <input v-model="form.currentSalary" required placeholder="15000000" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" @click="showModal = false" class="px-3 py-1.5 text-slate-500 hover:text-slate-800 transition dark:text-slate-400 dark:hover:text-slate-100">Batal</button>
            <button type="submit" class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl">Simpan</button>
          </div>
        </form>
      </Modal>
    </div>

    <!-- Recycle Bin View -->
    <div v-else key="recycle" class="space-y-5">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-white">Recycle Bin Karyawan</h2>
          <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Karyawan yang dihapus dapat dipulihkan kembali.</p>
        </div>
        <button
          @click="recycle = false"
          class="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          ← Kembali
        </button>
      </div>

      <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div v-if="deletedEmployees.length" class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-800">
              <tr>
                <th class="py-3 px-4">Kode</th>
                <th class="py-3 px-4">Nama Karyawan</th>
                <th class="py-3 px-4">Email</th>
                <th class="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
              <tr v-for="emp in deletedEmployees" :key="emp.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">{{ emp.employeeCode }}</td>
                <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{{ emp.firstName }} {{ emp.lastName || '' }}</td>
                <td class="py-3 px-4 text-slate-600 dark:text-slate-400">{{ emp.email }}</td>
                <td class="py-3 px-4 text-right space-x-1">
                  <button @click="restoreEmployee(emp)" class="px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20">
                    Pulihkan
                  </button>
                  <button @click="permanentDeleteEmployee(emp)" class="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20">
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

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api/axios';
import { useAuthStore } from '../stores/auth';
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import Modal from '../components/ui/Modal.vue';

const pagination = ref({
  page: 1,
  limit: 5,
  totalRecords: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
});

const authStore = useAuthStore();
const employeesList = ref([]);
const departmentsList = ref([]);
const positionsList = ref([]);
const selectedDepartment = ref('');
const deletedEmployees = ref([]);
const recycle = ref(false);
const loading = ref(true);
const searchQuery = ref('');
const showModal = ref(false);
const isEditMode = ref(false);
const activeId = ref(null);

const form = ref({
  employeeCode: '',
  firstName: '',
  lastName: '',
  email: '',
  gender: 'male',
  maritalStatus: 'Single',
  departmentId: '',
  positionId: '',
  currentSalary: '',
  hireDate: '2024-01-01',
  birthDate: '1995-01-01',
});

const canManage = computed(() => {
  return ['superadmin', 'admin_ti', 'hr'].includes(authStore.userRole);
});

const filteredEmployees = computed(() => {
  let list = employeesList.value;

  if (selectedDepartment.value) {
    list = list.filter((e) => e.departmentName === selectedDepartment.value);
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (e) =>
        e.firstName.toLowerCase().includes(q) ||
        (e.lastName && e.lastName.toLowerCase().includes(q)) ||
        e.employeeCode.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
    );
  }

  return list;
});

const fetchDepartments = async () => {
  try {
    const res = await api.get('/departments');
    departmentsList.value = res.data.data;
  } catch (err) {
    console.error('Error fetching departments for filter:', err);
  }
};

const fetchPositions = async () => {
  try {
    const res = await api.get('/positions');
    positionsList.value = res.data.data;
  } catch (err) {
    console.error('Error fetching positions list:', err);
  }
};

const fetchEmployees = async () => {
  try {
    const res = await api.get('/employees', {
      params: {
        page: pagination.value.page,
        limit: pagination.value.limit,
      },
    });
    employeesList.value = res.data.data;
    pagination.value = res.data.pagination;
  } catch (err) {
    console.error('Error fetching employees:', err);
  } finally {
    loading.value = false;
  }
};

const openRecycle = async () => {
  try {
    deletedEmployees.value = (await api.get('/employees/recycle-bin')).data.data;
    recycle.value = true;
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memuat recycle bin karyawan');
  }
};

const restoreEmployee = async (emp) => {
  try {
    await api.post(`/employees/${emp.id}/restore`);
    deletedEmployees.value = deletedEmployees.value.filter(item => item.id !== emp.id);
    fetchEmployees();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memulihkan karyawan');
  }
};

const permanentDeleteEmployee = async (emp) => {
  if (!confirm(`Hapus permanen karyawan "${emp.firstName}"?`)) return;
  try {
    await api.delete(`/employees/${emp.id}/permanent`);
    deletedEmployees.value = deletedEmployees.value.filter(item => item.id !== emp.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus permanen karyawan');
  }
};

const handlePageChange = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    pagination.value.page = page;
    fetchEmployees();
  }
};

const openAddModal = () => {
  isEditMode.value = false;
  form.value = {
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    gender: 'male',
    maritalStatus: 'Single',
    departmentId: departmentsList.value[0]?.id || '',
    positionId: positionsList.value[0]?.id || '',
    currentSalary: '',
    hireDate: '2024-01-01',
    birthDate: '1995-01-01',
  };
  showModal.value = true;
};

const openEditModal = (emp) => {
  isEditMode.value = true;
  activeId.value = emp.id;
  const matchedDept = departmentsList.value.find(d => d.name === emp.departmentName);
  const matchedPos = positionsList.value.find(p => p.title === emp.positionTitle);

  form.value = {
    employeeCode: emp.employeeCode,
    firstName: emp.firstName,
    lastName: emp.lastName || '',
    email: emp.email,
    gender: emp.gender || 'male',
    maritalStatus: emp.maritalStatus || 'Single',
    departmentId: matchedDept ? matchedDept.id : (departmentsList.value[0]?.id || 1),
    positionId: matchedPos ? matchedPos.id : (positionsList.value[0]?.id || 1),
    currentSalary: emp.currentSalary,
    hireDate: emp.hireDate || '2024-01-01',
    birthDate: emp.birthDate || '1995-01-01',
  };
  showModal.value = true;
};

const saveEmployee = async () => {
  try {
    if (isEditMode.value) {
      await api.put(`/employees/${activeId.value}`, form.value);
    } else {
      await api.post('/employees', form.value);
    }
    showModal.value = false;
    fetchEmployees();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan data karyawan');
  }
};

const confirmDelete = async (emp) => {
  if (confirm(`Apakah Anda yakin ingin menghapus karyawan ${emp.firstName}?`)) {
    try {
      await api.delete(`/employees/${emp.id}`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus karyawan');
    }
  }
};

onMounted(() => {
  fetchEmployees();
  fetchDepartments();
  fetchPositions();
});
</script>

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
