<template>
  <div class="space-y-6">
    <!-- Clean Header 1-Line & Navigation -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
      <div>
        <h2 class="text-xl font-bold text-slate-900 tracking-tight">Prediksi Turnover & Evaluasi AI</h2>
        <p class="text-xs text-slate-500 mt-0.5">Analisis risiko turnover, produktivitas, dan action playbook HRD.</p>
      </div>

      <!-- Mode Tabs Switcher -->
      <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
        <button
          @click="activeMode = 'history'"
          class="px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
          :class="activeMode === 'history' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
        >
          <History class="w-3.5 h-3.5" />
          <span>Riwayat Scan AI</span>
        </button>

        <button
          @click="activeMode = 'scan'"
          class="px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5"
          :class="activeMode === 'scan' ? 'bg-white text-indigo-600 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'"
        >
          <Play class="w-3.5 h-3.5" />
          <span>Jalankan Scan Baru</span>
        </button>
      </div>
    </div>

    <!-- ================= MODE 1: JALANKAN SCAN AI ================= -->
    <div v-if="activeMode === 'scan'" class="space-y-5">
      <!-- Target Evaluation Period Selector Bar -->
      <div class="flex items-center justify-between p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-indigo-600" />
          <span class="font-bold text-slate-800">Target Periode Evaluasi:</span>
          <select v-model="selectedActivePeriodId" class="px-3 py-1.5 font-bold text-indigo-700 bg-white border border-indigo-200 rounded-xl focus:outline-none cursor-pointer shadow-2xs">
            <option v-for="p in evaluationPeriodsList" :key="p.id" :value="p.id">
              {{ p.periodCode }} - {{ p.name }}
            </option>
          </select>
        </div>
        <span class="text-indigo-900/70 text-[11px] font-medium hidden sm:inline">
          Data absensi, lembur &amp; KPI akan dihitung dari periode ini.
        </span>
      </div>

      <!-- Sub-mode Switcher: Batch Scan vs Single Employee -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3 border border-slate-200/80 rounded-2xl">
        <div class="flex items-center gap-1 bg-white p-1 border border-slate-200 rounded-xl text-xs shadow-xs">
          <button
            @click="scanType = 'batch'"
            class="px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
            :class="scanType === 'batch' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'"
          >
            <Users class="w-3.5 h-3.5" />
            <span>Scan Masif Tim / Divisi</span>
          </button>
          <button
            @click="scanType = 'single'"
            class="px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5"
            :class="scanType === 'single' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'"
          >
            <UserCheck class="w-3.5 h-3.5" />
            <span>Scan Karyawan Spesifik</span>
          </button>
        </div>

        <!-- Filter Department for Batch Scan -->
        <div v-if="scanType === 'batch'" class="flex items-center gap-2">
          <span class="text-xs font-semibold text-slate-600">Filter Divisi:</span>
          <select v-model="batchDeptFilter" class="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-medium">
            <option value="">Semua Divisi ({{ allEmployees.length }} Karyawan)</option>
            <option v-for="dept in allDepartments" :key="dept.id" :value="dept.id">{{ dept.name }}</option>
          </select>

          <button
            @click="runBatchScan"
            :disabled="scanningBatch"
            class="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
          >
            <Zap class="w-3.5 h-3.5" />
            <span>{{ scanningBatch ? 'Memindai...' : `Mulai Scan (${targetBatchEmployees.length})` }}</span>
          </button>
        </div>

        <!-- Searchable Dropdown for Single Scan -->
        <div v-else class="relative min-w-[260px]">
          <button
            type="button"
            @click="showEmployeeDropdown = !showEmployeeDropdown"
            class="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 font-semibold flex items-center justify-between gap-2 shadow-xs hover:bg-slate-50 transition"
          >
            <span class="truncate">{{ selectedSingleEmployeeLabel }}</span>
            <ChevronRight class="w-3.5 h-3.5 text-slate-400 transition-transform duration-200" :class="showEmployeeDropdown ? 'rotate-90' : ''" />
          </button>

          <!-- Search Popover -->
          <div
            v-if="showEmployeeDropdown"
            class="absolute top-full right-0 mt-1.5 w-72 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 space-y-1.5 font-sans"
          >
            <div class="relative">
              <Search class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                v-model="employeeSearchQuery"
                type="text"
                placeholder="Cari karyawan..."
                class="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div class="max-h-48 overflow-y-auto divide-y divide-slate-100">
              <button
                v-for="emp in filteredEmployeesLimit5"
                :key="emp.id"
                @click="selectSingleEmployee(emp)"
                class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition flex items-center justify-between"
                :class="selectedSingleEmployeeId === emp.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-700'"
              >
                <div class="truncate">
                  <span class="block font-semibold">{{ emp.firstName }} {{ emp.lastName || '' }}</span>
                  <span class="text-[10px] text-slate-400 font-mono">{{ emp.employeeCode }}</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Action Banner to Save Scan (Only when valid scan results exist) -->
      <div v-if="validScanResultsCount > 0" class="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-800">
        <div class="flex items-center gap-2">
          <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Hasil scan AI terbaru untuk <strong>{{ validScanResultsCount }} karyawan</strong> siap disimpan ke riwayat database.</span>
        </div>
        <button
          @click="saveScanResultsToDatabase"
          :disabled="savingScan"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition shrink-0 flex items-center gap-1.5"
        >
          <Save class="w-4 h-4" />
          <span>{{ savingScan ? 'Menyimpan...' : 'Simpan Hasil Scan Ke DB' }}</span>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="scanningBatch" class="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
        <div class="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
        <p class="text-xs font-semibold text-slate-700">Menganalisis pohon keputusan & model Logistic Regression...</p>
      </div>

      <!-- Scan Results List View -->
      <div v-else-if="latestScanResults.length > 0" class="space-y-4">
        <div
          v-for="item in latestScanResults"
          :key="item.id"
          class="bg-slate-50 border rounded-2xl p-5 space-y-4 transition hover:bg-white"
          :class="{
            'border-amber-300 bg-amber-50/40': item.hasError,
            'border-rose-200 bg-rose-50/20 shadow-xs': !item.hasError && (item.prediction.riskLevel === 'critical' || item.prediction.riskLevel === 'high'),
            'border-amber-200 bg-amber-50/20': !item.hasError && item.prediction.riskLevel === 'medium',
            'border-slate-200/80': !item.hasError && item.prediction.riskLevel === 'low'
          }"
        >
          <!-- Error State Card (Data Incomplete) -->
          <div v-if="item.hasError" class="flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center font-bold text-amber-700 text-sm shadow-2xs">
                !
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900">{{ item.firstName }} {{ item.lastName || '' }}</h3>
                <span class="text-xs text-rose-600 font-semibold block mt-0.5">{{ item.errorMessage }}</span>
              </div>
            </div>
            <span class="px-3 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-xl font-bold uppercase text-[10px]">
              Gagal Scan (Data Incomplete)
            </span>
          </div>

          <!-- Normal Valid State Card -->
          <template v-else>
            <!-- Card Top Summary Bar -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center font-bold text-indigo-600 text-sm shadow-2xs">
                  {{ item.firstName.charAt(0) }}
                </div>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">{{ item.firstName }} {{ item.lastName || '' }}</h3>
                  <span class="text-xs text-slate-500 font-medium">{{ item.departmentName || '-' }} · <span class="font-mono text-indigo-600 font-bold">{{ item.employeeCode }}</span></span>
                </div>
              </div>

              <!-- Risk Badge & Detail Trigger Button -->
              <div class="flex items-center gap-3 self-start sm:self-auto">
                <div class="text-right">
                  <span class="text-xs font-bold text-slate-400 uppercase">Risiko:</span>
                  <span class="text-xl font-extrabold font-mono ml-1"
                    :class="{
                      'text-rose-600': item.prediction.riskLevel === 'critical' || item.prediction.riskLevel === 'high',
                      'text-amber-600': item.prediction.riskLevel === 'medium',
                      'text-emerald-600': item.prediction.riskLevel === 'low'
                    }"
                  >
                    {{ item.prediction.riskPercent }}%
                  </span>
                </div>
                <span
                  class="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md border"
                  :class="{
                    'bg-rose-100 text-rose-700 border-rose-200': item.prediction.riskLevel === 'critical',
                    'bg-rose-50 text-rose-600 border-rose-200': item.prediction.riskLevel === 'high',
                    'bg-amber-50 text-amber-700 border-amber-200': item.prediction.riskLevel === 'medium',
                    'bg-emerald-50 text-emerald-700 border-emerald-200': item.prediction.riskLevel === 'low'
                  }"
                >
                  {{ item.prediction.riskLevel }} Risk
                </span>

                <button
                  @click="openEmployeeDetail(item)"
                  class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 shadow-xs ml-2"
                >
                  <Eye class="w-3.5 h-3.5" />
                  <span>Lihat Detail Analysis</span>
                </button>
              </div>
            </div>

            <!-- Quick Feature Impact Badges -->
            <div class="p-3 bg-white rounded-xl border border-slate-200/80 space-y-2">
              <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Faktor Pemicu Utama (Feature Impact):</span>
              <div class="flex flex-wrap items-center gap-2">
                <span
                  v-for="(factor, idx) in item.prediction.primaryRiskFactors"
                  :key="idx"
                  class="px-2.5 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5"
                  :class="factor.direction === 'decrease' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'"
                >
                  <span>{{ factor.factor }}</span>
                  <span class="font-mono text-[10px] opacity-80">({{ (factor.weight * 100).toFixed(0) }}% impact)</span>
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div v-else class="p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl">
        <Play class="w-10 h-10 mx-auto text-slate-400 mb-2" />
        <h3 class="text-sm font-bold text-slate-800">Siap Melakukan Pemindaian AI</h3>
        <p class="text-xs text-slate-400 mt-1">Pilih filter divisi lalu klik <strong>"Mulai Scan"</strong> untuk mengevaluasi tingkat risiko tim secara masif.</p>
      </div>
    </div>

    <!-- ================= MODE 2: RIWAYAT SCAN PER PERIODE ================= -->
    <div v-if="activeMode === 'history'" class="space-y-5">
      <!-- Period Info Bar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 border border-slate-200/80 rounded-2xl">
        <div class="flex items-center gap-2">
          <Calendar class="w-4 h-4 text-indigo-600" />
          <span class="text-xs font-bold text-slate-700">Filter Periode:</span>
          
          <select v-model="selectedActivePeriodId" @change="fetchHistoryForPeriod" class="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-xl focus:outline-none cursor-pointer shadow-2xs">
            <option value="">Semua Periode Evaluasi</option>
            <option v-for="p in evaluationPeriodsList" :key="p.id" :value="p.id">
              {{ p.periodCode }} - {{ p.name }}
            </option>
          </select>
        </div>

        <div class="text-xs text-slate-500 font-medium">
          Total Karyawan Dipindai pada Periode Ini: <strong class="text-slate-900 font-mono">{{ groupedHistoryList.length }} Karyawan</strong>
        </div>
      </div>

      <!-- History Table / Grouped Cards by Employee -->
      <div v-if="loadingHistory" class="p-8 text-center text-slate-400 text-xs">Memuat riwayat scan dari database...</div>

      <div v-else-if="groupedHistoryList.length > 0" class="space-y-3">
        <div
          v-for="group in groupedHistoryList"
          :key="group.employeeId"
          class="p-4 bg-white border border-slate-200/80 rounded-2xl transition space-y-3 shadow-2xs"
        >
          <!-- Employee Card Top Bar -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-xs shadow-2xs">
                {{ group.employeeName.charAt(0) }}
              </div>
              <div>
                <h4 class="text-xs font-bold text-slate-900">{{ group.employeeName }}</h4>
                <span class="text-[11px] text-slate-400">{{ group.departmentName || '-' }} · <span class="font-mono text-indigo-600 font-bold">{{ group.employeeCode }}</span></span>
              </div>
            </div>

            <div class="flex items-center gap-3 self-start sm:self-auto text-xs">
              <!-- Jika dipillih Periode Spesifik: Tampilkan Persentase Risiko Langsung -->
              <div v-if="selectedActivePeriodId && group.latestScan" class="flex items-center gap-3">
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Risiko Resign:</span>
                  <span
                    class="text-base font-extrabold font-mono"
                    :class="{
                      'text-rose-600': group.latestScan?.riskLevel === 'critical' || group.latestScan?.riskLevel === 'high',
                      'text-amber-600': group.latestScan?.riskLevel === 'medium',
                      'text-emerald-600': group.latestScan?.riskLevel === 'low'
                    }"
                  >
                    {{ (Number(group.latestScan?.riskScore || 0) * 100).toFixed(1) }}%
                  </span>
                </div>

                <span
                  class="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md border"
                  :class="{
                    'bg-rose-100 text-rose-700 border-rose-200': group.latestScan?.riskLevel === 'critical' || group.latestScan?.riskLevel === 'high',
                    'bg-amber-100 text-amber-700 border-amber-200': group.latestScan?.riskLevel === 'medium',
                    'bg-emerald-100 text-emerald-700 border-emerald-200': group.latestScan?.riskLevel === 'low'
                  }"
                >
                  {{ group.latestScan?.riskLevel || 'N/A' }}
                </span>
              </div>

              <!-- Jika dipillih 'Semua Periode Evaluasi': Tampilkan Tombol Bandingkan Seluruh Scan -->
              <template v-else>
                <div class="text-right">
                  <span class="text-[10px] text-slate-400 uppercase block">Total Dipindai:</span>
                  <span class="font-bold font-mono text-slate-800 text-xs bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">{{ group.totalScans }} Periode</span>
                </div>

                <button
                  @click="toggleGroupExpand(group.employeeId)"
                  class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{{ expandedGroupEmpId === group.employeeId ? 'Sembunyikan Riwayat' : `Bandingkan (${group.totalScans} Scan)` }}</span>
                  <ChevronRight class="w-3.5 h-3.5 transition-transform" :class="expandedGroupEmpId === group.employeeId ? 'rotate-90' : ''" />
                </button>
              </template>

              <button
                @click="openHistoryDetail(group.latestScan)"
                class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 shadow-xs ml-1"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>Lihat Detail</span>
              </button>
            </div>
          </div>

          <!-- Accordion Content: Per-Scan Timeline & Comparison -->
          <div v-if="expandedGroupEmpId === group.employeeId" class="pt-2 space-y-2 border-t border-slate-100 font-sans">
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Perbandingan Seluruh Hasil Scan Karyawan Ini:</span>
            
            <div class="space-y-2 max-h-64 overflow-y-auto pr-1">
              <div
                v-for="scanItem in group.scans"
                :key="scanItem.predictionId"
                class="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 text-xs hover:bg-slate-100/70 transition"
              >
                <div class="flex items-center gap-3">
                  <div class="text-left font-mono">
                    <span class="block text-[11px] font-bold text-slate-700">{{ new Date(scanItem.createdAt).toLocaleString('id-ID') }}</span>
                    <span class="text-[10px] text-slate-400">ID Scan: #{{ scanItem.predictionId }}</span>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="font-bold font-mono text-xs"
                      :class="{
                        'text-rose-600': scanItem.riskLevel === 'critical' || scanItem.riskLevel === 'high',
                        'text-amber-600': scanItem.riskLevel === 'medium',
                        'text-emerald-600': scanItem.riskLevel === 'low'
                      }"
                    >
                      {{ (Number(scanItem.riskScore) * 100).toFixed(1) }}%
                    </span>

                    <span
                      class="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-md border"
                      :class="{
                        'bg-rose-100 text-rose-700 border-rose-200': scanItem.riskLevel === 'critical' || scanItem.riskLevel === 'high',
                        'bg-amber-100 text-amber-700 border-amber-200': scanItem.riskLevel === 'medium',
                        'bg-emerald-100 text-emerald-700 border-emerald-200': scanItem.riskLevel === 'low'
                      }"
                    >
                      {{ scanItem.riskLevel }}
                    </span>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <button
                    @click="openHistoryDetail(scanItem)"
                    class="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-200 text-[11px] transition flex items-center gap-1"
                  >
                    <Eye class="w-3 h-3" />
                    <span>Diagnostik</span>
                  </button>

                  <button
                    @click="deleteScanRecord(scanItem.predictionId)"
                    class="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg transition"
                    title="Hapus Hasil Scan Ini"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="p-12 text-center bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-400">
        Belum ada riwayat pemindaian tersimpan untuk bulan ini.
      </div>
    </div>  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/api/axios';
import { predictEmployeeTurnover } from '@/services/rfEngine';
import {
  Play,
  History,
  Users,
  UserCheck,
  Search,
  ChevronRight,
  ChevronLeft,
  Zap,
  CheckCircle2,
  Save,
  Calendar,
  Eye,
  Trash2,
  BrainCircuit,
  Activity,
  Award,
  Target
} from 'lucide-vue-next';
import Modal from '@/components/ui/Modal.vue';

const activeMode = ref('history');
const scanType = ref('batch');
const router = useRouter();

const allEmployees = ref([]);
const allDepartments = ref([]);
const attendancesList = ref([]);
const evaluationsList = ref([]);
const evaluationPeriodsList = ref([]);
const selectedActivePeriodId = ref('');

const batchDeptFilter = ref('');
const scanningBatch = ref(false);
const savingScan = ref(false);
const latestScanResults = ref([]);

const selectedSingleEmployeeId = ref('');
const showEmployeeDropdown = ref(false);
const employeeSearchQuery = ref('');

const historyList = ref([]);
const availableScanMonths = ref([]);
const selectedHistoryMonth = ref('');
const loadingHistory = ref(false);
const expandedGroupEmpId = ref(null);

const toggleGroupExpand = (empId) => {
  if (expandedGroupEmpId.value === empId) {
    expandedGroupEmpId.value = null;
  } else {
    expandedGroupEmpId.value = empId;
  }
};

const deleteScanRecord = async (predictionId) => {
  if (!confirm('Apakah Anda yakin ingin menghapus record riwayat scan ini?')) return;
  try {
    await api.delete(`/analytics/scan/${predictionId}`);
    fetchHistoryForPeriod();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menghapus hasil scan');
  }
};

const groupedHistoryList = computed(() => {
  if (!historyList.value.length) return [];
  const map = new Map();

  historyList.value.forEach(item => {
    if (!map.has(item.employeeId)) {
      map.set(item.employeeId, {
        employeeId: item.employeeId,
        employeeName: item.employeeName,
        employeeCode: item.employeeCode,
        departmentName: item.departmentName,
        totalScans: 1,
        latestScan: item,
        scans: [item]
      });
    } else {
      const existing = map.get(item.employeeId);
      existing.totalScans += 1;
      existing.scans.push(item);
    }
  });

  return Array.from(map.values());
});

const formatMonthLabel = (mStr) => {
  if (!mStr) return 'Semua Waktu';
  const [year, month] = mStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1, 1);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
};

const navigateMonth = (direction) => {
  if (!availableScanMonths.value.length) return;
  if (!selectedHistoryMonth.value) {
    selectedHistoryMonth.value = availableScanMonths.value[0].month;
    fetchHistoryForMonth();
    return;
  }

  const currentIndex = availableScanMonths.value.findIndex(m => m.month === selectedHistoryMonth.value);
  if (currentIndex === -1) return;

  const nextIndex = currentIndex - direction; // reversed because index 0 is latest
  if (nextIndex >= 0 && nextIndex < availableScanMonths.value.length) {
    selectedHistoryMonth.value = availableScanMonths.value[nextIndex].month;
    fetchHistoryForMonth();
  }
};

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

const selectedSingleEmployeeLabel = computed(() => {
  const emp = allEmployees.value.find(e => String(e.id) === String(selectedSingleEmployeeId.value));
  return emp ? `${emp.employeeCode} - ${emp.firstName} ${emp.lastName || ''}` : 'Pilih Karyawan...';
});

const targetBatchEmployees = computed(() => {
  if (!batchDeptFilter.value) return allEmployees.value;
  return allEmployees.value.filter(e => String(e.departmentId) === String(batchDeptFilter.value));
});

const validScanResultsCount = computed(() => {
  return latestScanResults.value.filter(res => !res.hasError && res.prediction).length;
});

const openEmployeeDetail = (item) => {
  router.push({
    path: `/analytics/${item.id}`,
    query: { periodId: selectedActivePeriodId.value }
  });
};

const openHistoryDetail = (item) => {
  router.push(`/analytics/scan/${item.predictionId}`);
};

const fetchMasters = async () => {
  try {
    const [empRes, deptRes, attendRes, evalRes, trainRes, surveyRes, promoRes, salaryRes] = await Promise.all([
      api.get('/employees', { params: { limit: 500 } }),
      api.get('/departments'),
      api.get('/operational/attendances', { params: { limit: 1000 } }),
      api.get('/operational/evaluations', { params: { limit: 100 } }),
      api.get('/operational/employee-trainings', { params: { limit: 500 } }),
      api.get('/surveys'),
      api.get('/operational/promotions'),
      api.get('/operational/salary-histories'),
    ]);

    allDepartments.value = deptRes.data.data;
    attendancesList.value = attendRes.data.data;
    evaluationsList.value = evalRes.data.data;

    let allResponses = [];
    if (surveyRes.data.data && surveyRes.data.data.length > 0) {
      for (const surv of surveyRes.data.data) {
        try {
          const respRes = await api.get(`/surveys/${surv.id}/responses`);
          const survResponses = (respRes.data.data?.responses || []).map(r => ({
            ...r,
            surveyPeriodId: surv.periodId,
          }));
          allResponses.push(...survResponses);
        } catch (e) {}
      }
    }

    allEmployees.value = employeesWithDetails(
      empRes.data.data,
      trainRes.data.data,
      allResponses,
      promoRes.data.data || [],
      salaryRes.data.data || []
    );
  } catch (err) {
    console.error('Error fetching masters for AI analytics:', err);
  }
};

const employeesWithDetails = (employees, empTrainings, surveyResponses, promotionsData, salaryHistoriesData) => {
  const now = new Date();
  return employees.map(emp => {
    let age = null;
    if (emp.birthDate) {
      const bDate = new Date(emp.birthDate);
      age = now.getFullYear() - bDate.getFullYear();
    }

    let tenureMonths = null;
    if (emp.hireDate) {
      const hDate = new Date(emp.hireDate);
      tenureMonths = (now.getFullYear() - hDate.getFullYear()) * 12 + (now.getMonth() - hDate.getMonth());
      if (tenureMonths < 1) tenureMonths = 1;
    }

    const trainingCount = empTrainings.filter(t => String(t.employeeId) === String(emp.id)).length;
    const promotionsCount = promotionsData.filter(p => String(p.employeeId) === String(emp.id)).length;
    const empSalaries = salaryHistoriesData.filter(s => String(s.employeeId) === String(emp.id));
    const lastSalaryIncrementPct = empSalaries.length > 0 ? Number(empSalaries[0].incrementPercentage || 0) : 0;
    const empSurveyList = surveyResponses.filter(r => String(r.employeeId) === String(emp.id));

    return {
      ...emp,
      calculatedAge: age,
      calculatedTenure: tenureMonths,
      trainingCount,
      promotionsCount,
      lastSalaryIncrementPct,
      empSurveyList,
    };
  });
};

const runInferenceForEmployeeObj = (emp) => {
  // Ambil data rentang tanggal & kode periode terpilih
  const currentPeriodObj = evaluationPeriodsList.value.find(p => String(p.id) === String(selectedActivePeriodId.value));
  
  let empAttend = [];
  if (currentPeriodObj && currentPeriodObj.startDate && currentPeriodObj.endDate) {
    empAttend = attendancesList.value.filter(a => {
      if (String(a.employeeId) !== String(emp.id)) return false;
      if (!a.date) return false;
      return a.date >= currentPeriodObj.startDate && a.date <= currentPeriodObj.endDate;
    });
  } else {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    empAttend = attendancesList.value.filter(a => {
      if (String(a.employeeId) !== String(emp.id)) return false;
      if (!a.date) return false;
      return new Date(a.date) >= ninetyDaysAgo;
    });
  }

  const totalOvertime = empAttend.reduce((s, a) => s + parseFloat(a.overtimeHours || 0), 0);
  const totalLate = empAttend.reduce((s, a) => s + parseInt(a.lateMinutes || 0), 0);

  // Cari evaluasi KPI spesifik untuk periode ini
  let empEval = null;
  if (currentPeriodObj && currentPeriodObj.periodCode) {
    const code = currentPeriodObj.periodCode.trim().toUpperCase();
    empEval = evaluationsList.value.find(e => 
      String(e.employeeId) === String(emp.id) && 
      e.period && e.period.trim().toUpperCase() === code
    );
  } else {
    empEval = evaluationsList.value.find(e => String(e.employeeId) === String(emp.id));
  }

  // Cari survey kepuasan spesifik untuk periode ini
  let empSurvey = null;
  if (currentPeriodObj && currentPeriodObj.id && emp.empSurveyList) {
    empSurvey = emp.empSurveyList.find(s => String(s.surveyPeriodId) === String(currentPeriodObj.id));
  }
  if (!empSurvey && emp.empSurveyList && emp.empSurveyList.length > 0) {
    empSurvey = emp.empSurveyList[0];
  }

  const jobSatisfaction = empSurvey ? Number(empSurvey.jobSatisfactionScore || null) : null;
  const envSatisfaction = empSurvey ? Number(empSurvey.workEnvironmentScore || null) : null;
  const worklifeBalance = empSurvey ? Number(empSurvey.workLifeBalanceScore || null) : null;

  // VALIDASI KETAT DATA MANDATORI KARYAWAN
  const missingFields = [];
  if (emp.calculatedAge == null) missingFields.push('Tanggal Lahir / Usia');
  if (emp.calculatedTenure == null) missingFields.push('Tanggal Masuk (Tenure)');
  if (!emp.currentSalary) missingFields.push('Gaji Saat Ini');
  if (!empEval) missingFields.push(`Evaluasi KPI Periode ${currentPeriodObj?.periodCode || ''}`);
  if (jobSatisfaction == null || envSatisfaction == null || worklifeBalance == null) {
    missingFields.push(`Survey Kepuasan Karyawan Periode ${currentPeriodObj?.periodCode || ''}`);
  }

  if (missingFields.length > 0) {
    return {
      ...emp,
      hasError: true,
      errorMessage: `Data belum lengkap (${missingFields.join(', ')}). Harap lengkapi data terlebih dahulu.`,
      prediction: null,
    };
  }

  const inputFeatures = {
    age: emp.calculatedAge,
    tenure_months: emp.calculatedTenure,
    current_salary: Number(emp.currentSalary),
    salary_increment_pct: Number(emp.lastSalaryIncrementPct || 0), // Promosi/gaji opsional, default 0%
    overtime_hours: totalOvertime,
    late_minutes: totalLate,
    leave_days: 2,
    kpi_score: Number(empEval.kpiScore),
    workload_score: Number(empEval.workloadScore),
    gender: emp.gender || 'male',
    maritalStatus: emp.maritalStatus || 'Single',
    env_satisfaction: envSatisfaction != null ? envSatisfaction : 3,
    worklife_balance: worklifeBalance != null ? worklifeBalance : 3,
    training_count: Number(emp.trainingCount || 0), // Pelatihan opsional (bisa 0)
    promotions_count: Number(emp.promotionsCount || 0), // Promosi opsional (bisa 0)
    job_satisfaction: jobSatisfaction != null ? jobSatisfaction : 3,
  };

  const prediction = predictEmployeeTurnover(inputFeatures);

  return {
    ...emp,
    totalOvertime,
    totalLate,
    hasError: false,
    prediction,
  };
};

const runBatchScan = () => {
  scanningBatch.value = true;
  setTimeout(() => {
    const list = targetBatchEmployees.value.map(emp => runInferenceForEmployeeObj(emp));
    list.sort((a, b) => {
      const scoreA = a.prediction ? Number(a.prediction.riskScore || 0) : -1;
      const scoreB = b.prediction ? Number(b.prediction.riskScore || 0) : -1;
      return scoreB - scoreA;
    });
    latestScanResults.value = list;
    scanningBatch.value = false;
  }, 300);
};

const selectSingleEmployee = (emp) => {
  selectedSingleEmployeeId.value = emp.id;
  showEmployeeDropdown.value = false;
  employeeSearchQuery.value = '';
  const result = runInferenceForEmployeeObj(emp);
  latestScanResults.value = [result];
  if (!result.hasError && result.prediction) {
    openEmployeeDetail(result);
  }
};

const saveScanResultsToDatabase = async () => {
  const validScanResults = latestScanResults.value.filter(res => !res.hasError && res.prediction);
  if (!validScanResults.length) {
    alert('Tidak ada hasil scan valid yang dapat disimpan. Harap lengkapi data karyawan terlebih dahulu.');
    return;
  }
  savingScan.value = true;
  try {
    const items = validScanResults.map(res => ({
      employeeId: res.id,
      riskScore: res.prediction.riskScore,
      riskLevel: res.prediction.riskLevel,
      primaryRiskFactors: res.prediction.primaryRiskFactors,
    }));

    await api.post('/analytics/scan', { items, periodId: selectedActivePeriodId.value });
    alert(`Berhasil menyimpan ${items.length} hasil scan AI ke database (Terikat Periode Evaluasi).`);
    fetchHistoryForPeriod();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan hasil scan ke database');
  } finally {
    savingScan.value = false;
  }
};

const fetchHistoryForPeriod = async () => {
  loadingHistory.value = true;
  try {
    const params = selectedActivePeriodId.value ? { periodId: selectedActivePeriodId.value } : {};
    const res = await api.get('/analytics/turnover-risk', { params });
    historyList.value = res.data.data || [];
  } catch (err) {
    console.error(err);
  } finally {
    loadingHistory.value = false;
  }
};

const fetchPeriods = async () => {
  try {
    const res = await api.get('/analytics/periods');
    evaluationPeriodsList.value = res.data.data || [];
    if (evaluationPeriodsList.value.length > 0 && !selectedActivePeriodId.value) {
      selectedActivePeriodId.value = evaluationPeriodsList.value[0].id;
    }
  } catch (err) {
    console.error('Error fetching evaluation periods:', err);
  }
};

onMounted(async () => {
  await fetchMasters();
  await fetchPeriods();
  fetchHistoryForPeriod();
});
</script>
