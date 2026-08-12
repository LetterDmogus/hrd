<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="border-b border-slate-200/80 pb-4 dark:border-slate-800">
      <h2 class="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Manajemen Gaji Karyawan</h2>
      <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Pencatatan dan pemantauan riwayat penyesuaian serta kenaikan gaji berkala karyawan.</p>
    </div>

    <div class="space-y-5">
      <!-- Filter Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 border border-slate-200/80 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <!-- Searchable Employee Filter Dropdown -->
        <div class="flex items-center gap-3 flex-1">
          <label class="text-xs font-bold text-slate-700 shrink-0 dark:text-slate-300">Filter Karyawan:</label>
          <div class="relative min-w-[240px]">
            <button
              type="button"
              @click="showEmployeeDropdown = !showEmployeeDropdown"
              class="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold flex items-center justify-between gap-2 shadow-xs hover:bg-slate-50 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <span class="truncate">{{ selectedFilterEmployeeLabel }}</span>
              <ChevronRight class="w-4 h-4 text-slate-400 transition-transform duration-200 dark:text-slate-500" :class="showEmployeeDropdown ? 'rotate-90' : ''" />
            </button>

            <!-- Search Popover -->
            <div
              v-if="showEmployeeDropdown"
              class="absolute top-full left-0 mt-1 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1.5 font-sans dark:bg-slate-800 dark:border-slate-700"
            >
              <div class="relative">
                <Search class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  v-model="employeeSearchQuery"
                  type="text"
                  placeholder="Cari karyawan..."
                  class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-100 dark:focus:border-indigo-500"
                />
              </div>

              <div class="max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                <button
                  @click="filterByEmployee('')"
                  class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition font-semibold dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                  :class="selectedFilterEmployeeId === '' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'"
                >
                  Semua Karyawan
                </button>

                <button
                  v-for="emp in filteredEmployeesLimit5"
                  :key="emp.id"
                  @click="filterByEmployee(emp.id)"
                  class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition flex items-center justify-between dark:hover:bg-indigo-500/10 dark:hover:text-indigo-400"
                  :class="String(selectedFilterEmployeeId) === String(emp.id) ? 'bg-indigo-50 text-indigo-600 font-bold dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'"
                >
                  <div class="truncate">
                    <span class="block font-semibold">{{ emp.firstName }} {{ emp.lastName || '' }}</span>
                    <span class="text-[10px] text-slate-400 font-mono dark:text-slate-500">{{ emp.employeeCode }}</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Record Button -->
        <div v-if="canManage">
          <button
            @click="showAddSalaryModal = true"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus class="w-4 h-4" /><span>Catat Kenaikan Gaji</span>
          </button>
        </div>
      </div>

      <!-- Salary Table -->
      <div v-if="loadingSalary" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat riwayat kenaikan gaji...</div>
      <div v-else-if="salaryHistoryList.length > 0" class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs dark:bg-slate-900 dark:border-slate-800">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3">Karyawan</th>
                <th class="px-4 py-3">Tanggal Efektif</th>
                <th class="px-4 py-3 text-right">Gaji Sebelum</th>
                <th class="px-4 py-3 text-right">Gaji Sesudah</th>
                <th class="px-4 py-3 text-center">Kenaikan (%)</th>
                <th class="px-4 py-3">Alasan / Catatan</th>
                <th v-if="canManage" class="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              <tr v-for="row in salaryHistoryList" :key="row.id" class="hover:bg-slate-50/70 transition dark:hover:bg-slate-800/40">
                <td class="px-4 py-3">
                  <div class="font-bold text-slate-900 dark:text-slate-100">{{ row.employeeName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono dark:text-slate-500">{{ row.employeeCode }} · {{ row.departmentName || '-' }}</div>
                </td>
                <td class="px-4 py-3 font-mono text-[11px] dark:text-slate-400">
                  {{ new Date(row.effectiveDate).toLocaleDateString('id-ID') }}
                </td>
                <td class="px-4 py-3 text-right font-mono text-slate-500 dark:text-slate-500">
                  Rp {{ Number(row.oldSalary || 0).toLocaleString('id-ID') }}
                </td>
                <td class="px-4 py-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                  Rp {{ Number(row.newSalary).toLocaleString('id-ID') }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono font-bold rounded-md text-[11px] border border-emerald-200 inline-block dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">
                    +{{ row.incrementPercentage }}%
                  </span>
                </td>
                <td class="px-4 py-3 text-slate-600 max-w-xs truncate dark:text-slate-400">
                  {{ row.reason || '-' }}
                </td>
                <td v-if="canManage" class="px-4 py-3 text-center">
                  <button @click="deleteSalaryRecord(row.id)" class="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-rose-400 dark:hover:bg-rose-500/10" title="Hapus Catatan Gaji">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500">
        Belum ada catatan riwayat gaji untuk karyawan yang dipilih.
      </div>
    </div>

    <!-- MODAL: ADD SALARY RECORD -->
    <Modal :open="showAddSalaryModal" title="Catat Kenaikan Gaji Karyawan" @close="showAddSalaryModal = false">
      <form @submit.prevent="submitSalary" class="space-y-3.5 text-xs font-sans">
        <div>
          <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Pilih Karyawan *</label>
          <select v-model="salaryForm.employeeId" required @change="onSalaryEmployeeChange" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="">-- Pilih Karyawan --</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">
              {{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }} ({{ emp.departmentName || '-' }})
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Gaji Sebelum (Rp)</label>
            <input v-model="salaryForm.previousSalary" type="number" readonly class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-mono font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Gaji Baru (Rp) *</label>
            <input v-model="salaryForm.newSalary" type="number" required placeholder="12000000" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Kenaikan (%)</label>
            <input :value="calculatedIncrementPercentage" type="text" readonly class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-emerald-700 font-mono font-bold dark:bg-slate-800 dark:border-slate-700 dark:text-emerald-400" />
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Tanggal Efektif *</label>
            <input v-model="salaryForm.effectiveDate" type="date" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Alasan / Catatan Penyesuaian Gaji</label>
          <textarea v-model="salaryForm.reason" rows="2" placeholder="Contoh: Penyesuaian Tahunan / Review Kinerja Memuaskan..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAddSalaryModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold dark:border-slate-700 dark:text-slate-300">Batal</button>
          <button type="submit" :disabled="submittingSalary" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold">
            {{ submittingSalary ? 'Menyimpan...' : 'Simpan Kenaikan Gaji' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';
import Modal from '../components/ui/Modal.vue';
import {
  TrendingUp,
  Plus,
  Search,
  ChevronRight,
  Trash2
} from 'lucide-vue-next';

const auth = useAuthStore();
const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(auth.userRole));

const allEmployees = ref([]);
const salaryHistoryList = ref([]);
const loadingSalary = ref(false);

const selectedFilterEmployeeId = ref('');
const showEmployeeDropdown = ref(false);
const employeeSearchQuery = ref('');

const showAddSalaryModal = ref(false);
const submittingSalary = ref(false);
const salaryForm = ref({
  employeeId: '',
  previousSalary: 0,
  newSalary: '',
  effectiveDate: new Date().toISOString().slice(0, 10),
  reason: '',
});

const filteredEmployeesLimit5 = computed(() => {
  if (!employeeSearchQuery.value) return allEmployees.value.slice(0, 5);
  const q = employeeSearchQuery.value.toLowerCase();
  return allEmployees.value
    .filter(emp => {
      const name = `${emp.firstName} ${emp.lastName || ''}`.toLowerCase();
      const code = (emp.employeeCode || '').toLowerCase();
      return name.includes(q) || code.includes(q);
    })
    .slice(0, 5);
});

const selectedFilterEmployeeLabel = computed(() => {
  if (!selectedFilterEmployeeId.value) return 'Semua Karyawan';
  const found = allEmployees.value.find(e => String(e.id) === String(selectedFilterEmployeeId.value));
  return found ? `${found.firstName} ${found.lastName || ''}` : 'Semua Karyawan';
});

const calculatedIncrementPercentage = computed(() => {
  const prev = Number(salaryForm.value.previousSalary || 0);
  const next = Number(salaryForm.value.newSalary || 0);
  if (prev <= 0 || next <= 0) return '0%';
  const pct = ((next - prev) / prev) * 100;
  return `+${pct.toFixed(1)}%`;
});

const filterByEmployee = (empId) => {
  selectedFilterEmployeeId.value = empId;
  showEmployeeDropdown.value = false;
  employeeSearchQuery.value = '';
  fetchSalaryHistories();
};

const onSalaryEmployeeChange = () => {
  const emp = allEmployees.value.find(e => String(e.id) === String(salaryForm.value.employeeId));
  if (emp) {
    salaryForm.value.previousSalary = Number(emp.currentSalary || emp.salary || 0);
  }
};

const fetchMasters = async () => {
  try {
    const res = await api.get('/employees', { params: { limit: 500 } });
    allEmployees.value = res.data.data || [];
  } catch (err) {
    console.error('Error fetching employees:', err);
  }
};

const fetchSalaryHistories = async () => {
  loadingSalary.value = true;
  try {
    const params = selectedFilterEmployeeId.value ? { employeeId: selectedFilterEmployeeId.value } : {};
    const res = await api.get('/operational/salary-histories', { params });
    salaryHistoryList.value = res.data.data || [];
  } catch (err) {
    console.error('Error fetching salary histories:', err);
  } finally {
    loadingSalary.value = false;
  }
};

const submitSalary = async () => {
  submittingSalary.value = true;
  try {
    const payload = {
      employeeId: salaryForm.value.employeeId,
      oldSalary: salaryForm.value.previousSalary,
      newSalary: salaryForm.value.newSalary,
      effectiveDate: salaryForm.value.effectiveDate,
      reason: salaryForm.value.reason,
    };
    await api.post('/operational/salary-histories', payload);
    alert('Berhasil mencatat kenaikan gaji karyawan');
    showAddSalaryModal.value = false;
    salaryForm.value = {
      employeeId: '',
      previousSalary: 0,
      newSalary: '',
      effectiveDate: new Date().toISOString().slice(0, 10),
      reason: '',
    };
    fetchSalaryHistories();
    fetchMasters();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan catatan gaji');
  } finally {
    submittingSalary.value = false;
  }
};

const deleteSalaryRecord = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus catatan gaji ini?')) return;
  try {
    await api.delete(`/operational/salary-histories/${id}`);
    fetchSalaryHistories();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus catatan gaji');
  }
};

onMounted(() => {
  fetchMasters();
  fetchSalaryHistories();
});
</script>
