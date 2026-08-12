<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="p-5 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs dark:from-indigo-500/10 dark:to-violet-500/10 dark:border-indigo-500/20">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider">Training & Certification Hub</span>
          <h2 class="text-base font-bold text-slate-900 tracking-tight dark:text-white">Manajemen Pelatihan & Penugasan Karyawan</h2>
        </div>
        <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Kelola katalog modul pelatihan internal/eksternal dan lacak progres penugasan karyawan secara real-time.</p>
      </div>

      <button
        v-if="canManage"
        @click="showAssignModal = true"
        class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
      >
        <Plus class="w-4 h-4" />
        <span>Tugaskan Pelatihan Baru</span>
      </button>
    </div>

    <!-- Main Tabs: 1. Penugasan & Progres Status Karyawan | 2. Katalog Modul Training -->
    <div class="border-b border-slate-200 flex items-center gap-6 text-xs font-bold dark:border-slate-800">
      <button
        @click="activeTab = 'assignments'"
        class="pb-3 transition flex items-center gap-2 border-b-2"
        :class="activeTab === 'assignments' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'"
      >
        <GraduationCap class="w-4 h-4" />
        <span>Penugasan & Progres Karyawan</span>
      </button>

      <button
        @click="activeTab = 'catalog'"
        class="pb-3 transition flex items-center gap-2 border-b-2"
        :class="activeTab === 'catalog' ? 'border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100'"
      >
        <BookOpen class="w-4 h-4" />
        <span>Katalog Modul Training</span>
      </button>
    </div>

    <!-- ================= TAB 1: PENUGASAN & PROGRES STATUS KARYAWAN ================= -->
    <div v-if="activeTab === 'assignments'" class="space-y-4">
      <!-- Filter Bar: Search, Status Filter & Department Filter -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 border border-slate-200/80 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <div class="flex flex-wrap items-center gap-2">
          <!-- Filter Status -->
          <div class="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1 text-xs shadow-2xs dark:bg-slate-800 dark:border-slate-700">
            <button
              v-for="st in statusFilterOptions"
              :key="st.value"
              @click="selectedStatusFilter = st.value"
              class="px-2.5 py-1 rounded-lg font-semibold transition"
              :class="selectedStatusFilter === st.value ? 'bg-slate-900 text-white dark:bg-indigo-600' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'"
            >
              {{ st.label }}
            </button>
          </div>

          <!-- Filter Kategori Modul -->
          <select v-model="selectedCategoryFilter" class="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="">Semua Kategori Modul</option>
            <option v-for="cat in categoryOptions" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
          </select>
        </div>

        <!-- Search Input -->
        <div class="relative min-w-[240px]">
          <Search class="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            v-model="assignmentSearchQuery"
            type="text"
            placeholder="Cari nama karyawan, NIK, modul..."
            class="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-medium dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:focus:border-indigo-500"
          />
        </div>
      </div>

      <!-- Assignments Table -->
      <div v-if="loadingAssignments" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data penugasan pelatihan...</div>

      <div v-else-if="filteredAssignments.length > 0" class="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs dark:bg-slate-900 dark:border-slate-800">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
              <tr>
                <th class="px-4 py-3">Karyawan</th>
                <th class="px-4 py-3">Modul Pelatihan</th>
                <th class="px-4 py-3">Kategori & Provider</th>
                <th class="px-4 py-3 text-center">Status Progres</th>
                <th class="px-4 py-3 text-center">Nilai Final</th>
                <th class="px-4 py-3">Tanggal Selesai</th>
                <th v-if="canManage" class="px-4 py-3 text-center">Aksi / Ubah Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
              <tr v-for="row in filteredAssignments" :key="row.id" class="hover:bg-slate-50/70 transition dark:hover:bg-slate-800/40">
                <td class="px-4 py-3">
                  <div class="font-bold text-slate-900 dark:text-slate-100">{{ row.employeeName }}</div>
                  <div class="text-[11px] text-slate-400 font-mono dark:text-slate-500">{{ row.employeeCode }} · {{ row.departmentName || '-' }}</div>
                </td>
                <td class="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">
                  {{ row.trainingTitle }}
                </td>
                <td class="px-4 py-3 text-[11px]">
                  <span class="block font-semibold text-indigo-600 dark:text-indigo-400">{{ row.trainingCategory || '-' }}</span>
                  <span class="text-slate-400 dark:text-slate-500">{{ row.provider || 'Internal Provider' }}</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="px-2.5 py-0.5 rounded-md font-bold uppercase text-[10px] border inline-block"
                    :class="{
                      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30': row.status === 'in_progress',
                      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30': row.status === 'completed',
                      'bg-blue-50 text-blue-700 border-blue-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30': row.status === 'enrolled',
                      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30': row.status === 'failed'
                    }"
                  >
                    {{ formatStatusLabel(row.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center font-mono font-bold text-slate-800 dark:text-slate-200">
                  {{ row.score ? `${row.score}/100` : '-' }}
                </td>
                <td class="px-4 py-3 text-slate-500 font-mono text-[11px] dark:text-slate-500">
                  {{ row.completionDate ? new Date(row.completionDate).toLocaleDateString('id-ID') : '-' }}
                </td>
                <td v-if="canManage" class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-1.5">
                    <!-- Quick Mark as Completed Button -->
                    <button
                      v-if="row.status === 'in_progress' || row.status === 'enrolled'"
                      @click="openUpdateStatusModal(row, 'completed')"
                      class="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold transition shadow-2xs flex items-center gap-1"
                      title="Set Selesai Pelatihan"
                    >
                      <CheckCircle2 class="w-3 h-3" />
                      <span>Set Selesai</span>
                    </button>

                    <!-- Edit Status Option -->
                    <button
                      @click="openUpdateStatusModal(row, row.status)"
                      class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300"
                      title="Ubah Status / Nilai"
                    >
                      Ubah Status
                    </button>

                    <!-- Delete Assignment -->
                    <button
                      @click="deleteAssignment(row.id)"
                      class="p-1 text-rose-600 hover:bg-rose-50 rounded-lg transition dark:text-rose-400 dark:hover:bg-rose-500/10"
                      title="Hapus Penugasan Ini"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-else class="p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-400 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-500">
        Tidak ditemukan data penugasan pelatihan sesuai filter.
      </div>
    </div>

    <!-- ================= TAB 2: KATALOG MODUL TRAINING (AdminCrudView) ================= -->
    <div v-if="activeTab === 'catalog'" class="space-y-4">
      <div class="flex justify-end mb-2">
        <button
          v-if="canManage"
          @click="openRecycle"
          class="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Recycle Bin Modul
        </button>
      </div>

      <AdminCrudView
        v-if="!recycle"
        resource-label="Training"
        endpoint="/trainings"
        :columns="columns"
        :fields="fields"
        :initial-form="{ title: '', category: '', provider: '', durationHours: '' }"
        search-placeholder="Cari modul training..."
        add-label="Tambah Modul Training"
        loading-text="Memuat data modul training..."
        empty-text="Tidak ditemukan data modul training."
        :can-manage="canManage"
      />

      <!-- Recycle Bin View -->
      <div v-else class="space-y-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl dark:bg-slate-900 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Recycle Bin Modul Training</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">Modul pelatihan yang dihapus dapat dipulihkan.</p>
          </div>
          <button @click="recycle = false" class="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold dark:bg-slate-800 dark:hover:bg-slate-700">Tutup Recycle Bin</button>
        </div>

        <div v-if="deleted.length > 0" class="divide-y divide-slate-200 border rounded-xl bg-white dark:divide-slate-800 dark:border-slate-700 dark:bg-slate-800">
          <div v-for="row in deleted" :key="row.id" class="p-3 flex items-center justify-between text-xs">
            <div>
              <span class="font-bold text-slate-900 block dark:text-slate-100">{{ row.title }}</span>
              <span class="text-slate-400 dark:text-slate-500">{{ row.category }} · {{ row.provider }}</span>
            </div>
            <div class="flex items-center gap-2">
              <button @click="restore(row)" class="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30">Pulihkan</button>
              <button @click="permanentDelete(row)" class="px-2.5 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30">Hapus Permanen</button>
            </div>
          </div>
        </div>
        <div v-else class="text-slate-400 text-center py-6 text-xs dark:text-slate-500">Recycle bin kosong.</div>
      </div>
    </div>

    <!-- ================= MODAL 1: TUGASKAN PELATIHAN BARU ================= -->
    <Modal :open="showAssignModal" title="Tugaskan Pelatihan Kepada Karyawan" @close="showAssignModal = false">
      <form @submit.prevent="submitAssignment" class="space-y-4 text-xs font-sans">
        <div>
          <label class="block font-bold text-slate-700 mb-1 dark:text-slate-400">Pilih Karyawan *</label>
          <select v-model="assignForm.employeeId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="">-- Pilih Karyawan --</option>
            <option v-for="emp in allEmployees" :key="emp.id" :value="emp.id">
              {{ emp.employeeCode }} - {{ emp.firstName }} {{ emp.lastName || '' }} ({{ emp.departmentName || '-' }})
            </option>
          </select>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1 dark:text-slate-400">Pilih Modul Pelatihan *</label>
          <select v-model="assignForm.trainingId" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="">-- Pilih Modul Pelatihan --</option>
            <option v-for="t in allTrainings" :key="t.id" :value="t.id">
              {{ t.title }} ({{ t.category }})
            </option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-400">Status Penugasan *</label>
            <select v-model="assignForm.status" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <option value="enrolled">Terdaftar (Enrolled)</option>
              <option value="in_progress">Dalam Proses (In Progress)</option>
              <option value="completed">Selesai (Completed)</option>
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-400">Nilai Final (Optional 0-100)</label>
            <input v-model="assignForm.score" type="number" min="0" max="100" placeholder="Misal: 90" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showAssignModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">Batal</button>
          <button type="submit" :disabled="submittingAssign" class="px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold">
            {{ submittingAssign ? 'Menyimpan...' : 'Simpan Penugasan' }}
          </button>
        </div>
      </form>
    </Modal>

    <!-- ================= MODAL 2: UBAH STATUS & SET SELESAI ================= -->
    <Modal :open="showStatusModal" title="Ubah Status Progres Pelatihan" @close="showStatusModal = false">
      <form @submit.prevent="submitUpdateStatus" class="space-y-4 text-xs font-sans">
        <div v-if="editingAssignment" class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 dark:bg-slate-800/50 dark:border-slate-700">
          <span class="block font-bold text-slate-900 dark:text-slate-100">{{ editingAssignment.employeeName }}</span>
          <span class="text-[11px] text-slate-500 block dark:text-slate-400">Modul: <strong>{{ editingAssignment.trainingTitle }}</strong></span>
        </div>

        <div>
          <label class="block font-bold text-slate-700 mb-1 dark:text-slate-400">Pilih Status Baru *</label>
          <select v-model="statusForm.status" required class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-medium bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
            <option value="in_progress">Dalam Proses (In Progress)</option>
            <option value="completed">Selesai (Completed)</option>
            <option value="enrolled">Terdaftar (Enrolled)</option>
            <option value="failed">Gagal / Tidak Lulus (Failed)</option>
          </select>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-400">Nilai Final (0-100)</label>
            <input v-model="statusForm.score" type="number" min="0" max="100" placeholder="85" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1 dark:text-slate-400">Tanggal Selesai</label>
            <input v-model="statusForm.completionDate" type="date" class="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" />
          </div>
        </div>

        <div class="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" @click="showStatusModal = false" class="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800">Batal</button>
          <button type="submit" :disabled="submittingStatus" class="px-4 py-2 bg-emerald-600 text-white rounded-xl font-semibold">
            {{ submittingStatus ? 'Menyimpan...' : 'Perbarui Status' }}
          </button>
        </div>
      </form>
    </Modal>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';
import AdminCrudView from '../components/admin/AdminCrudView.vue';
import Modal from '../components/ui/Modal.vue';
import {
  GraduationCap,
  BookOpen,
  Plus,
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-vue-next';

const auth = useAuthStore();
const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(auth.userRole));

const activeTab = ref('assignments'); // 'assignments' | 'catalog'
const assignmentsList = ref([]);
const allEmployees = ref([]);
const allTrainings = ref([]);
const loadingAssignments = ref(false);

const assignmentSearchQuery = ref('');
const selectedStatusFilter = ref(''); // '' | 'in_progress' | 'completed' | 'enrolled' | 'failed'
const selectedCategoryFilter = ref('');

const showAssignModal = ref(false);
const submittingAssign = ref(false);
const assignForm = ref({
  employeeId: '',
  trainingId: '',
  status: 'in_progress',
  score: '',
});

const showStatusModal = ref(false);
const submittingStatus = ref(false);
const editingAssignment = ref(null);
const statusForm = ref({
  status: 'completed',
  score: '',
  completionDate: '',
});

const recycle = ref(false);
const deleted = ref([]);

const columns = [
  { key: 'id', label: 'No' },
  { key: 'title', label: 'Judul Training' },
  { key: 'category', label: 'Kategori' },
  { key: 'provider', label: 'Provider' },
  { key: 'durationHours', label: 'Durasi (Jam)' }
];

const categoryOptions = [
  { value: 'Technical / IT Skills', label: 'Technical / IT Skills' },
  { value: 'Leadership & Management', label: 'Leadership & Management' },
  { value: 'Soft Skills & Communication', label: 'Soft Skills & Communication' },
  { value: 'Compliance & Safety', label: 'Compliance & Safety' },
  { value: 'Product & Domain Knowledge', label: 'Product & Domain Knowledge' },
  { value: 'Onboarding / Induction', label: 'Onboarding / Induction' },
];

const statusFilterOptions = [
  { value: '', label: 'Semua Status' },
  { value: 'in_progress', label: 'Dalam Proses' },
  { value: 'completed', label: 'Selesai' },
  { value: 'enrolled', label: 'Terdaftar' },
  { value: 'failed', label: 'Gagal' },
];

const fields = [
  { key: 'title', label: 'Judul Training', required: true, placeholder: 'Misal: Advanced Vue.js & Fastify' },
  { key: 'category', label: 'Kategori Training', type: 'select', required: true, options: [{ value: '', label: 'Pilih Kategori' }, ...categoryOptions] },
  { key: 'provider', label: 'Provider / Penyelenggara', required: true, placeholder: 'Internal / Udemy / Coursera' },
  { key: 'durationHours', label: 'Durasi (Jam)', type: 'number', required: true, placeholder: '8' }
];

const filteredAssignments = computed(() => {
  return assignmentsList.value.filter(item => {
    if (selectedStatusFilter.value && item.status !== selectedStatusFilter.value) return false;
    if (selectedCategoryFilter.value && item.trainingCategory !== selectedCategoryFilter.value) return false;

    if (assignmentSearchQuery.value) {
      const q = assignmentSearchQuery.value.toLowerCase();
      const empName = item.employeeName ? item.employeeName.toLowerCase() : '';
      const empCode = item.employeeCode ? item.employeeCode.toLowerCase() : '';
      const title = item.trainingTitle ? item.trainingTitle.toLowerCase() : '';
      return empName.includes(q) || empCode.includes(q) || title.includes(q);
    }
    return true;
  });
});

const formatStatusLabel = (st) => {
  switch (st) {
    case 'in_progress': return 'Dalam Proses';
    case 'completed': return 'Selesai';
    case 'enrolled': return 'Terdaftar';
    case 'failed': return 'Gagal';
    default: return st;
  }
};

const fetchAssignments = async () => {
  loadingAssignments.value = true;
  try {
    const res = await api.get('/operational/employee-trainings', { params: { limit: 1000 } });
    assignmentsList.value = res.data.data || [];
  } catch (err) {
    console.error('Error fetching assignments:', err);
  } finally {
    loadingAssignments.value = false;
  }
};

const fetchMasters = async () => {
  try {
    const [empRes, trainRes] = await Promise.all([
      api.get('/employees', { params: { limit: 500 } }),
      api.get('/trainings', { params: { limit: 500 } })
    ]);
    allEmployees.value = empRes.data.data || [];
    allTrainings.value = trainRes.data.data || [];
  } catch (err) {
    console.error(err);
  }
};

const submitAssignment = async () => {
  submittingAssign.value = true;
  try {
    await api.post('/operational/employee-trainings', assignForm.value);
    alert('Berhasil menugaskan pelatihan kepada karyawan');
    showAssignModal.value = false;
    assignForm.value = { employeeId: '', trainingId: '', status: 'in_progress', score: '' };
    fetchAssignments();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan penugasan pelatihan');
  } finally {
    submittingAssign.value = false;
  }
};

const openUpdateStatusModal = (row, targetStatus) => {
  editingAssignment.value = row;
  statusForm.value = {
    status: targetStatus || row.status,
    score: row.score || '',
    completionDate: row.completionDate ? row.completionDate.slice(0, 10) : (targetStatus === 'completed' ? new Date().toISOString().slice(0, 10) : ''),
  };
  showStatusModal.value = true;
};

const submitUpdateStatus = async () => {
  if (!editingAssignment.value) return;
  submittingStatus.value = true;
  try {
    await api.put(`/operational/employee-trainings/${editingAssignment.value.id}`, statusForm.value);
    alert('Berhasil memperbarui status penugasan pelatihan');
    showStatusModal.value = false;
    fetchAssignments();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memperbarui status pelatihan');
  } finally {
    submittingStatus.value = false;
  }
};

const deleteAssignment = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus penugasan pelatihan ini?')) return;
  try {
    await api.delete(`/operational/employee-trainings/${id}`);
    fetchAssignments();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus penugasan');
  }
};

const openRecycle = async () => {
  try {
    deleted.value = (await api.get('/trainings/recycle-bin')).data.data;
    recycle.value = true;
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memuat recycle bin');
  }
};

const restore = async row => {
  try {
    await api.post(`/trainings/${row.id}/restore`);
    deleted.value = deleted.value.filter(item => item.id !== row.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memulihkan training');
  }
};

const permanentDelete = async row => {
  if (!confirm(`Hapus permanen training "${row.title}"?`)) return;
  try {
    await api.delete(`/trainings/${row.id}/permanent`);
    deleted.value = deleted.value.filter(item => item.id !== row.id);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus permanen training');
  }
};

onMounted(() => {
  fetchAssignments();
  fetchMasters();
});
</script>
