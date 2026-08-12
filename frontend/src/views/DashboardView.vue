<template>
  <div class="space-y-6">
    <!-- Section: Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <!-- Card 1: Total Employees -->
      <div class="dash-bounce dash-bounce-1 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Karyawan</span>
            <h3 class="text-2xl font-extrabold text-slate-900 mt-1 dark:text-white">{{ summary.totalEmployees }}</h3>
          </div>
          <div class="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20">
            <Users class="w-5 h-5" />
          </div>
        </div>
        <p class="text-xs text-slate-400 mt-3 dark:text-slate-500">Karyawan aktif terdaftar</p>
      </div>

      <!-- Card 2: Total Departments -->
      <div class="dash-bounce dash-bounce-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Divisi Organisasi</span>
            <h3 class="text-2xl font-extrabold text-slate-900 mt-1 dark:text-white">{{ summary.totalDepartments }}</h3>
          </div>
          <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
            <Building2 class="w-5 h-5" />
          </div>
        </div>
        <p class="text-xs text-slate-400 mt-3 dark:text-slate-500">Struktur departemen aktif</p>
      </div>

      <!-- Card 3: High Risk Turnover -->
      <div class="dash-bounce dash-bounce-3 bg-rose-50/50 border border-rose-200 rounded-2xl p-5 shadow-xs dark:bg-rose-500/10 dark:border-rose-500/30">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Karyawan Berisiko Resign</span>
            <h3 class="text-2xl font-extrabold text-rose-600 mt-1 dark:text-rose-400">{{ summary.highRiskCount }} Karyawan</h3>
          </div>
          <div class="p-3 bg-rose-100 text-rose-600 rounded-2xl border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20">
            <AlertTriangle class="w-5 h-5" />
          </div>
        </div>
        <p class="text-xs text-rose-500 mt-3 dark:text-rose-400/80">Level risiko tinggi &amp; kritis</p>
      </div>
    </div>

    <!-- Section: Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-5">
      <!-- Chart 1: Employees per Department (Bar) -->
      <div class="dash-bounce dash-bounce-4 lg:col-span-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold text-slate-900 tracking-tight dark:text-white">Karyawan per Divisi</h2>
          <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ deptDistribution.length }} divisi</span>
        </div>

        <div v-if="loading" class="py-10 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data...</div>

        <div v-else-if="deptDistribution.length" class="space-y-3">
          <div v-for="d in deptDistribution" :key="d.name" class="flex items-center gap-3">
            <span class="w-32 sm:w-40 truncate text-xs font-semibold text-slate-600 dark:text-slate-400">{{ d.name }}</span>
            <div class="flex-1 h-2.5 bg-slate-200/70 rounded-full overflow-hidden dark:bg-slate-800">
              <div
                class="h-full rounded-full transition-all duration-500 bg-indigo-500 dark:bg-indigo-400"
                :style="`width:${(d.count / maxDeptCount) * 100}%`"
              ></div>
            </div>
            <span class="w-8 text-right text-xs font-bold text-slate-700 dark:text-slate-200">{{ d.count }}</span>
          </div>
        </div>

        <div v-else class="py-10 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada data karyawan.</div>
      </div>

      <!-- Chart 2: Risk Level Distribution (Donut) -->
      <div class="dash-bounce dash-bounce-5 lg:col-span-2 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-sm font-bold text-slate-900 tracking-tight dark:text-white">Distribusi Level Risiko</h2>
          <span class="text-[11px] text-slate-400 dark:text-slate-500">{{ latestRiskList.length }} prediksi</span>
        </div>

        <div v-if="loading" class="py-10 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data...</div>

        <div v-else-if="latestRiskList.length" class="flex items-center justify-center gap-6">
          <!-- Donut -->
          <div class="relative w-32 h-32 rounded-full shrink-0 transition-transform duration-500 hover:scale-105" :style="donutStyle">
            <div class="absolute inset-[18%] bg-slate-50 rounded-full flex items-center justify-center dark:bg-slate-900">
              <div class="text-center">
                <span class="block text-lg font-extrabold text-slate-900 dark:text-white">{{ summary.highRiskCount }}</span>
                <span class="block text-[9px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Berisiko</span>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="space-y-2">
            <div v-for="r in riskDistribution" :key="r.label" class="flex items-center gap-2 text-xs">
              <span class="w-2.5 h-2.5 rounded-full shrink-0" :style="`background:${r.color}`"></span>
              <span class="font-semibold text-slate-600 dark:text-slate-300">{{ r.label }}</span>
              <span class="ml-auto pl-3 font-bold text-slate-900 dark:text-white">{{ r.count }}</span>
            </div>
          </div>
        </div>

        <div v-else class="py-10 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada data risiko turnover.</div>
      </div>
    </div>

    <!-- Section: Risiko Resign per Kuartal -->
    <div class="dash-bounce dash-bounce-6 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs dark:bg-slate-900 dark:border-slate-800">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 class="text-sm font-bold text-slate-900 tracking-tight dark:text-white">Risiko Resign per Kuartal</h2>
          <p class="text-xs text-slate-500 mt-0.5 dark:text-slate-400">Tingkat karyawan berisiko resign (high/critical) keseluruhan &amp; per divisi dari data tersimpan.</p>
        </div>
        <select
          v-model="selectedPeriodId"
          class="px-3 py-1.5 text-xs font-bold text-indigo-700 bg-white border border-indigo-200 rounded-xl focus:outline-none cursor-pointer shadow-2xs dark:bg-slate-800 dark:border-slate-700 dark:text-indigo-400"
        >
          <option v-for="p in periodsList" :key="p.id" :value="p.id">{{ p.periodCode }} - {{ p.name }}</option>
        </select>
      </div>

      <!-- Summary Stats for Selected Quarter -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs dark:bg-slate-800 dark:border-slate-700">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Karyawan Dipindai</span>
          <h3 class="text-xl font-extrabold text-slate-900 mt-1 dark:text-white">{{ quarterSummary.total }}</h3>
        </div>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs dark:bg-slate-800 dark:border-slate-700">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Berisiko Tinggi</span>
          <h3 class="text-xl font-extrabold text-rose-600 mt-1 dark:text-rose-400">{{ quarterSummary.highRisk }} Karyawan</h3>
        </div>
        <div class="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-2xs dark:bg-slate-800 dark:border-slate-700">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Tingkat Risiko Keseluruhan</span>
          <h3 class="text-xl font-extrabold text-slate-900 mt-1 dark:text-white">{{ quarterSummary.highRiskPct }}<span class="text-sm">%</span></h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Per-Division Risk Bars -->
        <div>
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">Risiko per Divisi</h3>
          <p class="text-[10px] text-slate-400 mb-3 dark:text-slate-500">{{ selectedPeriodLabel }}</p>

          <div v-if="loading" class="py-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data...</div>
          <div v-else-if="deptRiskList.length" class="space-y-3">
            <div v-for="d in deptRiskList" :key="d.name" class="flex items-center gap-3">
              <span class="w-28 sm:w-36 truncate text-xs font-semibold text-slate-600 dark:text-slate-400">{{ d.name }}</span>
              <div class="flex-1 h-2.5 bg-slate-200/70 rounded-full overflow-hidden dark:bg-slate-800">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="riskBarColor(d.highRiskPct)"
                  :style="`width:${Math.min(100, d.highRiskPct)}%`"
                ></div>
              </div>
              <span class="w-16 text-right text-[11px] font-bold text-slate-700 dark:text-slate-300">{{ d.highRiskPct }}%</span>
            </div>
          </div>
          <div v-else class="py-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada data scan pada kuartal ini.</div>
        </div>

        <!-- Trend Across Quarters -->
        <div>
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider dark:text-slate-300">Perkembangan Tingkat Risiko</h3>
          <p class="text-[10px] text-slate-400 mb-3 dark:text-slate-500">% karyawan berisiko tinggi per kuartal</p>

          <div v-if="loading" class="py-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data...</div>
          <div v-else class="flex items-end gap-2 sm:gap-3 h-44 pt-2 px-1">
            <div v-for="t in quarterTrend" :key="t.periodId" class="flex-1 flex flex-col items-center gap-1.5 min-w-0">
              <span class="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">{{ t.pct }}%</span>
              <div
                class="w-full max-w-[44px] rounded-t-lg transition-all duration-700"
                :class="riskBarColor(t.pct)"
                :style="`height:${Math.max(4, t.pct)}%`"
              ></div>
              <span class="text-[10px] text-slate-400 font-semibold truncate dark:text-slate-500">{{ t.periodCode }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../api/axios';
import { Users, Building2, AlertTriangle } from 'lucide-vue-next';

const summary = ref({
  totalEmployees: 0,
  totalDepartments: 0,
  highRiskCount: 0,
});

const riskList = ref([]);
const employeesList = ref([]);
const loading = ref(true);

const RISK_META = {
  critical: { label: 'Kritis', color: '#e11d48' },
  high: { label: 'Tinggi', color: '#f43f5e' },
  medium: { label: 'Sedang', color: '#f59e0b' },
  low: { label: 'Rendah', color: '#10b981' },
};

const deptDistribution = computed(() => {
  const map = {};
  for (const emp of employeesList.value) {
    const name = emp.departmentName || 'Tanpa Divisi';
    map[name] = (map[name] || 0) + 1;
  }
  return Object.entries(map)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
});

const maxDeptCount = computed(() => {
  if (!deptDistribution.value.length) return 1;
  return deptDistribution.value[0].count;
});

// Ambil hanya prediksi TERBARU per karyawan (dedupe by employeeId, keep latest createdAt)
const latestRiskList = computed(() => {
  const latest = new Map();
  for (const item of riskList.value) {
    const prev = latest.get(item.employeeId);
    if (!prev || new Date(item.createdAt).getTime() > new Date(prev.createdAt).getTime()) {
      latest.set(item.employeeId, item);
    }
  }
  return Array.from(latest.values());
});

const riskDistribution = computed(() => {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const item of latestRiskList.value) {
    const key = RISK_META[item.riskLevel] ? item.riskLevel : 'low';
    counts[key] += 1;
  }
  return Object.keys(RISK_META).map(key => ({ label: RISK_META[key].label, color: RISK_META[key].color, count: counts[key] }));
});

const donutStyle = computed(() => {
  const total = latestRiskList.value.length;
  if (!total) return '';
  let acc = 0;
  const segments = riskDistribution.value
    .filter(r => r.count > 0)
    .map(r => {
      const start = (acc / total) * 100;
      acc += r.count;
      const end = (acc / total) * 100;
      return `${r.color} ${start}% ${end}%`;
    });
  return `background: conic-gradient(${segments.join(', ')});`;
});

const fetchDashboardData = async () => {
  loading.value = true;
  try {
    const [summaryRes, riskRes, empRes, quarterRes] = await Promise.all([
      api.get('/analytics/summary'),
      api.get('/analytics/turnover-risk'),
      api.get('/employees', { params: { limit: 1000 } }),
      api.get('/analytics/quarterly-risk'),
    ]);

    summary.value = summaryRes.data.data;
    riskList.value = riskRes.data.data || [];
    employeesList.value = empRes.data.data || [];
    quarterlyRisk.value = quarterRes.data.data || { defaultPeriodId: null, periods: [] };
    selectedPeriodId.value = quarterlyRisk.value.defaultPeriodId;
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
  } finally {
    loading.value = false;
  }
};

const quarterlyRisk = ref({ defaultPeriodId: null, periods: [] });
const selectedPeriodId = ref(null);

const periodsList = computed(() => quarterlyRisk.value.periods || []);

const selectedPeriodLabel = computed(() => {
  const p = periodsList.value.find(item => String(item.id) === String(selectedPeriodId.value));
  return p ? `${p.periodCode} - ${p.name}` : '';
});

const quarterSummary = computed(() => {
  const p = periodsList.value.find(item => String(item.id) === String(selectedPeriodId.value));
  return p ? { total: p.total, highRisk: p.highRisk, highRiskPct: p.highRiskPct } : { total: 0, highRisk: 0, highRiskPct: 0 };
});

const deptRiskList = computed(() => {
  const p = periodsList.value.find(item => String(item.id) === String(selectedPeriodId.value));
  return p ? p.departments : [];
});

const quarterTrend = computed(() =>
  periodsList.value.map(p => ({ periodId: p.id, periodCode: p.periodCode, pct: p.highRiskPct }))
);

const riskBarColor = (pct) => {
  if (pct >= 40) return 'bg-rose-500 dark:bg-rose-400';
  if (pct >= 20) return 'bg-amber-500 dark:bg-amber-400';
  return 'bg-emerald-500 dark:bg-emerald-400';
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
@keyframes dashBounceIn {
  0% {
    opacity: 0;
    transform: translateY(30px) scale(0.94);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.dash-bounce {
  opacity: 0;
  animation: dashBounceIn 0.75s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.dash-bounce-1 { animation-delay: 0.05s; }
.dash-bounce-2 { animation-delay: 0.15s; }
.dash-bounce-3 { animation-delay: 0.25s; }
.dash-bounce-4 { animation-delay: 0.35s; }
.dash-bounce-5 { animation-delay: 0.45s; }
.dash-bounce-6 { animation-delay: 0.55s; }
</style>
