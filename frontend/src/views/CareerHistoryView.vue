<template>
  <div class="space-y-6">
    <!-- Header Page -->
    <div class="border-b border-slate-200/80 pb-4 dark:border-slate-800">
      <h2 class="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Manajemen Gaji & Promosi Karyawan</h2>
      <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Pencatatan riwayat kenaikan gaji berkala serta promosi & mutasi jabatan karyawan.</p>
    </div>

    <!-- Main Layout: Sidebar Sub-Menu + Main Content -->
    <div class="flex flex-col md:flex-row gap-6 items-start">
      <!-- Left Sub-Menu Tabs -->
      <aside class="w-full md:w-64 bg-slate-50 border border-slate-200/80 rounded-2xl p-2 shrink-0 space-y-1 dark:bg-slate-900 dark:border-slate-800">
        <button
          @click="activeSubTab = 'salary'"
          class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition text-left"
          :class="activeSubTab === 'salary' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'"
        >
          <TrendingUp class="w-4 h-4 shrink-0" />
          <div class="truncate">
            <span class="block">Riwayat Kenaikan Gaji</span>
            <span class="text-[10px] text-slate-400 font-normal dark:text-slate-500">Penyesuaian & Presentase</span>
          </div>
        </button>

        <button
          @click="activeSubTab = 'promotion'"
          class="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-semibold transition text-left"
          :class="activeSubTab === 'promotion' ? 'bg-white text-indigo-600 shadow-xs border border-slate-200/60 dark:bg-slate-800 dark:text-indigo-400 dark:border-slate-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'"
        >
          <Award class="w-4 h-4 shrink-0" />
          <div class="truncate">
            <span class="block">Riwayat Promosi & Mutasi</span>
            <span class="text-[10px] text-slate-400 font-normal dark:text-slate-500">Jabatan & Departemen</span>
          </div>
        </button>
      </aside>

      <!-- Right Main Content Area -->
      <main class="flex-1 min-w-0 w-full space-y-5">
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
            <button v-if="activeSubTab === 'salary'" @click="showAddSalaryModal = true"
              class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5">
              <Plus class="w-4 h-4" /><span>Catat Kenaikan Gaji</span>
            </button>
            <button v-else-if="activeSubTab === 'promotion'" @click="showAddPromotionModal = true"
              class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5">
              <Plus class="w-4 h-4" /><span>Catat Promosi / Mutasi</span>
            </button>
          </div>
        </div>

        <!-- TAB CONTENT 1: RIWAYAT GAJI -->
        <div v-if="activeSubTab === 'salary'" class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div v-if="loadingSalary" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data riwayat gaji...</div>
          <div v-else-if="filteredSalaryHistories.length" class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Tgl Berlaku</th>
                  <th class="py-3 px-4">Karyawan</th>
                  <th class="py-3 px-4">Gaji Lama</th>
                  <th class="py-3 px-4">Gaji Baru</th>
                  <th class="py-3 px-4">Kenaikan (%)</th>
                  <th class="py-3 px-4">Alasan / Catatan</th>
                  <th class="py-3 px-4 text-right" v-if="canManage">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
                <tr v-for="item in filteredSalaryHistories" :key="item.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                  <td class="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{{ item.effectiveDate }}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {{ item.employeeName }}
                    <span class="block text-[10px] text-slate-400 font-mono dark:text-slate-500">{{ item.employeeCode }}</span>
                  </td>
                  <td class="py-3 px-4 font-mono text-slate-500 dark:text-slate-500">Rp {{ Number(item.oldSalary).toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-4 font-mono font-bold text-emerald-700 dark:text-emerald-400">Rp {{ Number(item.newSalary).toLocaleString('id-ID') }}</td>
                  <td class="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">+{{ item.incrementPercentage }}%</td>
                  <td class="py-3 px-4 text-slate-600 max-w-xs truncate dark:text-slate-400">{{ item.reason || '-' }}</td>
                  <td class="py-3 px-4 text-right" v-if="canManage">
                    <button @click="deleteSalaryHistory(item.id)" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada riwayat kenaikan gaji.</div>
        </div>

        <!-- TAB CONTENT 2: RIWAYAT PROMOSI -->
        <div v-if="activeSubTab === 'promotion'" class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800">
          <div v-if="loadingPromotions" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data riwayat promosi...</div>
          <div v-else-if="filteredPromotions.length" class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-800">
                <tr>
                  <th class="py-3 px-4">Tgl Promosi</th>
                  <th class="py-3 px-4">Karyawan</th>
                  <th class="py-3 px-4">Catatan Perubahan</th>
                  <th class="py-3 px-4 text-right" v-if="canManage">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200/60 dark:divide-slate-800">
                <tr v-for="item in filteredPromotions" :key="item.id" class="hover:bg-white transition dark:hover:bg-slate-800/40">
                  <td class="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{{ item.promotionDate }}</td>
                  <td class="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {{ item.employeeName }}
                    <span class="block text-[10px] text-indigo-600 font-mono dark:text-indigo-400">{{ item.employeeCode }}</span>
                  </td>
                  <td class="py-3 px-4 text-slate-700 max-w-sm font-medium dark:text-slate-300">{{ item.notes || 'Promosi / Mutasi Jabatan' }}</td>
                  <td class="py-3 px-4 text-right" v-if="canManage">
                    <button @click="deletePromotion(item.id)" class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-slate-500 dark:hover:text-rose-400 dark:hover:bg-rose-500/10">
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada riwayat promosi.</div>
        </div>
      </main>
    </div>

    <!-- MODALS -->
    <!-- MODAL: CATAT KENAIKAN GAJI -->
    <Modal :open="showAddSalaryModal" title="Catat Kenaikan Gaji Karyawan" @close="showAddSalaryModal = false">
      <form @submit.prevent="saveSalaryHistory" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Pilih Karyawan</label>
          <select v-model="salaryForm.employeeId" @change="onSalaryEmployeeSelect" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Pilih Karyawan</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">{{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }} (Gaji: Rp {{ Number(emp.currentSalary || 0).toLocaleString('id-ID') }})</option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Gaji Lama (Rp)</label>
            <input v-model="salaryForm.oldSalary" readonly class="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400" />
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Gaji Baru (Rp)</label>
            <input v-model="salaryForm.newSalary" type="number" required placeholder="18000000" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold" />
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Berlaku</label>
          <input v-model="salaryForm.effectiveDate" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Alasan / Catatan Penyesuaian</label>
          <input v-model="salaryForm.reason" placeholder="Annual Performance Review 2026" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAddSalaryModal = false" class="px-3 py-1.5 text-slate-500 dark:text-slate-400">Batal</button>
          <button type="submit" class="px-4 py-1.5 bg-indigo-600 text-white font-semibold rounded-xl">Simpan Kenaikan Gaji</button>
        </div>
      </form>
    </Modal>

    <!-- MODAL: CATAT PROMOSI / MUTASI -->
    <Modal :open="showAddPromotionModal" title="Catat Promosi / Mutasi Jabatan" @close="showAddPromotionModal = false">
      <form @submit.prevent="savePromotion" class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Pilih Karyawan</label>
          <select v-model="promotionForm.employeeId" @change="onPromotionEmployeeSelect" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="" disabled>Pilih Karyawan</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">
              {{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }} ({{ emp.departmentName || '-' }} | {{ emp.positionTitle || '-' }})
            </option>
          </select>
        </div>

        <!-- Info Posisi Saat Ini -->
        <div v-if="selectedPromotionEmp" class="p-2.5 bg-slate-100/80 border border-slate-200/80 rounded-xl space-y-1 text-[11px] dark:bg-slate-800 dark:border-slate-700">
          <span class="block font-bold text-slate-700 dark:text-slate-300">Posisi & Divisi Saat Ini:</span>
          <div class="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Departemen: <strong class="text-slate-800 dark:text-slate-100">{{ selectedPromotionEmp.departmentName || '-' }}</strong></span>
            <span>Jabatan: <strong class="text-slate-800 dark:text-slate-100">{{ selectedPromotionEmp.positionTitle || '-' }}</strong></span>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Departemen Baru</label>
            <select v-model="promotionForm.newDepartmentId" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="">Tidak Berubah (Tetap di {{ selectedPromotionEmp?.departmentName || 'Departemen Saat Ini' }})</option>
              <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
            </select>
          </div>
          <div>
            <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Jabatan Baru</label>
            <select v-model="promotionForm.newPositionId" class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="">Tidak Berubah (Tetap di {{ selectedPromotionEmp?.positionTitle || 'Jabatan Saat Ini' }})</option>
              <option v-for="pos in allPositions" :key="pos.id" :value="pos.id">{{ pos.title }}</option>
            </select>
          </div>
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Tanggal Efektif Promosi</label>
          <input v-model="promotionForm.promotionDate" type="date" required class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
        </div>
        <div>
          <label class="block font-semibold text-slate-600 mb-1 dark:text-slate-400">Catatan SK Promosi / Mutasi</label>
          <textarea v-model="promotionForm.notes" rows="2" placeholder="Nomor SK Promosi & rincian tugas baru..." class="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"></textarea>
        </div>
        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAddPromotionModal = false" class="px-3 py-1.5 text-slate-500 dark:text-slate-400">Batal</button>
          <button type="submit" class="px-4 py-1.5 bg-slate-900 text-white font-semibold rounded-xl">Simpan Promosi</button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '@/api/axios';
import { useAuthStore } from '@/stores/auth';
import { TrendingUp, Award, Plus, Trash2, Search, ChevronRight } from 'lucide-vue-next';
import Modal from '@/components/ui/Modal.vue';

const authStore = useAuthStore();
const activeSubTab = ref('salary');
const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(authStore.userRole));

const allEmployees = ref([]);
const allDepartments = ref([]);
const allPositions = ref([]);
const salaryHistoriesList = ref([]);
const promotionsList = ref([]);

const loadingSalary = ref(true);
const loadingPromotions = ref(true);

const showAddSalaryModal = ref(false);
const showAddPromotionModal = ref(false);

const selectedFilterEmployeeId = ref('');
const showEmployeeDropdown = ref(false);
const employeeSearchQuery = ref('');

const today = new Date().toISOString().slice(0, 10);

const salaryForm = ref({
  employeeId: '',
  oldSalary: 0,
  newSalary: '',
  effectiveDate: today,
  reason: '',
});

const promotionForm = ref({
  employeeId: '',
  newDepartmentId: '',
  newPositionId: '',
  promotionDate: today,
  notes: '',
});

const filteredEmployeesLimit5 = computed(() => {
  if (!employeeSearchQuery.value) {
    return allEmployees.value.slice(0, 5);
  }
  const q = employeeSearchQuery.value.toLowerCase();
  return allEmployees.value
    .filter(emp =>
      emp.firstName.toLowerCase().includes(q) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(q)) ||
      emp.employeeCode.toLowerCase().includes(q)
    )
    .slice(0, 5);
});

const selectedFilterEmployeeLabel = computed(() => {
  if (!selectedFilterEmployeeId.value) return 'Semua Karyawan';
  const emp = allEmployees.value.find(e => String(e.id) === String(selectedFilterEmployeeId.value));
  return emp ? `${emp.employeeCode} - ${emp.firstName} ${emp.lastName || ''}` : 'Semua Karyawan';
});

const filterByEmployee = (empId) => {
  selectedFilterEmployeeId.value = empId;
  showEmployeeDropdown.value = false;
  employeeSearchQuery.value = '';
};

const filteredSalaryHistories = computed(() => {
  if (!selectedFilterEmployeeId.value) return salaryHistoriesList.value;
  return salaryHistoriesList.value.filter(s => String(s.employeeId) === String(selectedFilterEmployeeId.value));
});

const filteredPromotions = computed(() => {
  if (!selectedFilterEmployeeId.value) return promotionsList.value;
  return promotionsList.value.filter(p => String(p.employeeId) === String(selectedFilterEmployeeId.value));
});

const selectedPromotionEmp = ref(null);

const onSalaryEmployeeSelect = () => {
  const emp = allEmployees.value.find(e => String(e.id) === String(salaryForm.value.employeeId));
  if (emp) {
    salaryForm.value.oldSalary = emp.currentSalary || 0;
  }
};

const onPromotionEmployeeSelect = () => {
  const emp = allEmployees.value.find(e => String(e.id) === String(promotionForm.value.employeeId));
  selectedPromotionEmp.value = emp || null;
};

const fetchMasters = async () => {
  try {
    const [empRes, deptRes, posRes] = await Promise.all([
      api.get('/employees', { params: { limit: 500 } }),
      api.get('/departments'),
      api.get('/positions'),
    ]);
    allEmployees.value = empRes.data.data;
    allDepartments.value = deptRes.data.data;
    allPositions.value = posRes.data.data;
  } catch (err) {
    console.error('Error fetching masters:', err);
  }
};

const fetchSalaryHistories = async () => {
  loadingSalary.value = true;
  try {
    const res = await api.get('/operational/salary-histories');
    salaryHistoriesList.value = res.data.data;
  } catch (err) { console.error(err); }
  finally { loadingSalary.value = false; }
};

const fetchPromotions = async () => {
  loadingPromotions.value = true;
  try {
    const res = await api.get('/operational/promotions');
    promotionsList.value = res.data.data;
  } catch (err) { console.error(err); }
  finally { loadingPromotions.value = false; }
};

const saveSalaryHistory = async () => {
  try {
    await api.post('/operational/salary-histories', salaryForm.value);
    showAddSalaryModal.value = false;
    await fetchMasters();
    fetchSalaryHistories();
  } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan kenaikan gaji'); }
};

const savePromotion = async () => {
  try {
    await api.post('/operational/promotions', promotionForm.value);
    showAddPromotionModal.value = false;
    await fetchMasters();
    fetchPromotions();
  } catch (err) { alert(err.response?.data?.message || 'Gagal menyimpan data promosi'); }
};

const deleteSalaryHistory = async (id) => {
  if (!confirm('Hapus riwayat kenaikan gaji ini?')) return;
  try { await api.delete(`/operational/salary-histories/${id}`); fetchSalaryHistories(); }
  catch (err) { alert(err.response?.data?.message || 'Gagal menghapus riwayat gaji'); }
};

const deletePromotion = async (id) => {
  if (!confirm('Hapus riwayat promosi ini?')) return;
  try { await api.delete(`/operational/promotions/${id}`); fetchPromotions(); }
  catch (err) { alert(err.response?.data?.message || 'Gagal menghapus data promosi'); }
};

onMounted(async () => {
  await fetchMasters();
  fetchSalaryHistories();
  fetchPromotions();
});
</script>
