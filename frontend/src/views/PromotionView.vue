<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="border-b border-slate-200/80 pb-4 dark:border-slate-800">
      <h2 class="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Manajemen Promosi & Mutasi Karyawan</h2>
      <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Pencatatan riwayat kenaikan jabatan, perpindahan departemen, dan jalur karir karyawan.</p>
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
            @click="showAddPromotionModal = true"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5"
          >
            <Plus class="w-4 h-4" /><span>Catat Promosi / Mutasi</span>
          </button>
        </div>
      </div>

      <!-- Promotion Table -->
      <div v-if="loadingPromotion" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat riwayat promosi...</div>
      <div v-else-if="promotionsList.length > 0" class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs dark:bg-slate-900 dark:border-slate-800">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3">Karyawan</th>
                <th class="px-4 py-3">Tanggal Promosi</th>
                <th class="px-4 py-3">Jabatan Sebelum → Sesudah</th>
                <th class="px-4 py-3">Departemen Sebelum → Sesudah</th>
                <th class="px-4 py-3">Alasan / SK Promosi</th>
                <th v-if="canManage" class="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              <tr v-for="row in promotionsList" :key="row.id" class="hover:bg-slate-50/70 transition dark:hover:bg-slate-800/40">
                <td class="px-4 py-3">
                  <div class="font-bold text-slate-900 dark:text-slate-100">{{ row.employeeName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono dark:text-slate-500">{{ row.employeeCode }}</div>
                </td>
                <td class="px-4 py-3 font-mono text-[11px] dark:text-slate-400">
                  {{ new Date(row.promotionDate).toLocaleDateString('id-ID') }}
                </td>
                <td class="px-4 py-3 text-[11px]">
                  <span class="text-slate-400 dark:text-slate-500">{{ row.previousPositionTitle || 'Staff' }}</span>
                  <span class="mx-1.5 text-indigo-500 font-bold dark:text-indigo-400">→</span>
                  <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ row.newPositionTitle }}</span>
                </td>
                <td class="px-4 py-3 text-[11px]">
                  <span class="text-slate-400 dark:text-slate-500">{{ row.previousDepartmentName || '-' }}</span>
                  <span class="mx-1.5 text-slate-400 dark:text-slate-500">→</span>
                  <span class="font-bold text-slate-800 dark:text-slate-200">{{ row.newDepartmentName || '-' }}</span>
                </td>
                <td class="px-4 py-3 text-slate-600 max-w-xs truncate dark:text-slate-400">
                  {{ row.reason || '-' }}
                </td>
                <td v-if="canManage" class="px-4 py-3 text-center">
                  <button @click="deletePromotionRecord(row.id)" class="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-rose-400 dark:hover:bg-rose-500/10" title="Hapus Catatan Promosi">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500">
        Belum ada catatan riwayat promosi untuk karyawan yang dipilih.
      </div>
    </div>

    <!-- MODAL: ADD PROMOTION RECORD -->
    <Modal :open="showAddPromotionModal" title="Catat Promosi / Mutasi Karyawan" @close="showAddPromotionModal = false">
      <form @submit.prevent="submitPromotion" class="space-y-3.5 text-xs font-sans">
        <div>
          <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Pilih Karyawan *</label>
          <select v-model="promotionForm.employeeId" required @change="onPromotionEmployeeChange" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="">-- Pilih Karyawan --</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">
              {{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }} ({{ emp.positionTitle || '-' }})
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Departemen Tujuan *</label>
            <select v-model="promotionForm.newDepartmentId" @change="promotionForm.newPositionId = ''" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="">-- Pilih Departemen --</option>
              <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">
                {{ dept.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Jabatan Baru *</label>
            <select v-model="promotionForm.newPositionId" required :disabled="!promotionForm.newDepartmentId" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium disabled:bg-slate-100 disabled:text-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:disabled:bg-slate-800/50 dark:disabled:text-slate-600">
              <option value="">-- {{ promotionForm.newDepartmentId ? 'Pilih Jabatan Baru' : 'Pilih Departemen Terlebih Dahulu' }} --</option>
              <option v-for="pos in filteredPositionsForSelectedDept" :key="pos.id" :value="pos.id">
                {{ pos.title }}
              </option>
            </select>
          </div>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Tanggal Promosi *</label>
          <input v-model="promotionForm.promotionDate" type="date" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1 dark:text-slate-300">Alasan / SK Promosi / Catatan</label>
          <textarea v-model="promotionForm.reason" rows="2" placeholder="Contoh: Promosi jabatan Lead / SK Nomor 102/HR/2026..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"></textarea>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAddPromotionModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold dark:border-slate-700 dark:text-slate-300">Batal</button>
          <button type="submit" :disabled="submittingPromotion" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold">
            {{ submittingPromotion ? 'Menyimpan...' : 'Simpan Promosi' }}
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
  Award,
  Plus,
  Search,
  ChevronRight,
  Trash2
} from 'lucide-vue-next';

const auth = useAuthStore();
const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(auth.userRole));

const allEmployees = ref([]);
const allPositions = ref([]);
const allDepartments = ref([]);
const promotionsList = ref([]);
const loadingPromotion = ref(false);

const selectedFilterEmployeeId = ref('');
const showEmployeeDropdown = ref(false);
const employeeSearchQuery = ref('');

const showAddPromotionModal = ref(false);
const submittingPromotion = ref(false);
const promotionForm = ref({
  employeeId: '',
  previousPositionId: '',
  newPositionId: '',
  previousDepartmentId: '',
  newDepartmentId: '',
  promotionDate: new Date().toISOString().slice(0, 10),
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

const currentEmployeePositionTitle = computed(() => {
  if (!promotionForm.value.employeeId) return '-';
  const emp = allEmployees.value.find(e => String(e.id) === String(promotionForm.value.employeeId));
  return emp ? (emp.positionTitle || 'Staff') : '-';
});

const filteredPositionsForSelectedDept = computed(() => {
  if (!promotionForm.value.newDepartmentId) return [];
  const list = allPositions.value.filter(pos => String(pos.departmentId) === String(promotionForm.value.newDepartmentId));
  
  // Deduplikasi berdasarkan judul (title) dan ID agar tidak muncul duplikat
  const uniqueMap = new Map();
  list.forEach(pos => {
    const key = pos.title ? pos.title.trim().toLowerCase() : String(pos.id);
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, pos);
    }
  });
  return Array.from(uniqueMap.values());
});

const filterByEmployee = (empId) => {
  selectedFilterEmployeeId.value = empId;
  showEmployeeDropdown.value = false;
  employeeSearchQuery.value = '';
  fetchPromotions();
};

const onPromotionEmployeeChange = () => {
  const emp = allEmployees.value.find(e => String(e.id) === String(promotionForm.value.employeeId));
  if (emp) {
    promotionForm.value.previousPositionId = emp.positionId || null;
    promotionForm.value.previousDepartmentId = emp.departmentId || null;
    // Set default Departemen Tujuan ke departemen karyawan saat ini jika belum diisi
    if (!promotionForm.value.newDepartmentId && emp.departmentId) {
      promotionForm.value.newDepartmentId = emp.departmentId;
    }
  }
};

const fetchMasters = async () => {
  try {
    const [empRes, posRes, deptRes] = await Promise.all([
      api.get('/employees', { params: { limit: 500 } }),
      api.get('/positions', { params: { limit: 500 } }),
      api.get('/departments')
    ]);
    allEmployees.value = empRes.data.data || [];
    allPositions.value = posRes.data.data || [];
    allDepartments.value = deptRes.data.data || [];
  } catch (err) {
    console.error('Error fetching masters:', err);
  }
};

const fetchPromotions = async () => {
  loadingPromotion.value = true;
  try {
    const params = selectedFilterEmployeeId.value ? { employeeId: selectedFilterEmployeeId.value } : {};
    const res = await api.get('/operational/promotions', { params });
    promotionsList.value = res.data.data || [];
  } catch (err) {
    console.error('Error fetching promotions:', err);
  } finally {
    loadingPromotion.value = false;
  }
};

const submitPromotion = async () => {
  submittingPromotion.value = true;
  try {
    await api.post('/operational/promotions', promotionForm.value);
    alert('Berhasil mencatat promosi / mutasi karyawan');
    showAddPromotionModal.value = false;
    promotionForm.value = {
      employeeId: '',
      previousPositionId: '',
      newPositionId: '',
      previousDepartmentId: '',
      newDepartmentId: '',
      promotionDate: new Date().toISOString().slice(0, 10),
      reason: '',
    };
    fetchPromotions();
    fetchMasters();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan catatan promosi');
  } finally {
    submittingPromotion.value = false;
  }
};

const deletePromotionRecord = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus catatan promosi ini?')) return;
  try {
    await api.delete(`/operational/promotions/${id}`);
    fetchPromotions();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus catatan promosi');
  }
};

onMounted(() => {
  fetchMasters();
  fetchPromotions();
});
</script>
