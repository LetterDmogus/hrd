<template>
  <div class="space-y-6">
    <!-- Navigation Back Header -->
    <div class="flex items-center justify-between border-b border-slate-200/80 pb-4">
      <div class="flex items-center gap-3">
        <button
          @click="$router.push('/analytics')"
          class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition flex items-center justify-center shadow-2xs"
          title="Kembali ke Analisis AI"
        >
          <ArrowLeft class="w-4 h-4" />
        </button>
        <div>
          <h2 class="text-xl font-bold text-slate-900 tracking-tight">Detail Diagnostik AI & Kinerja Karyawan</h2>
          <p class="text-xs text-slate-500 mt-0.5">Analisis mendalam risiko turnover, produktivitas, kesenjangan kompetensi, dan rencana aksi HRD.</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button
          v-if="empData && prediction"
          @click="exportToPdf"
          class="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs cursor-pointer"
          title="Cetak atau Simpan Laporan PDF"
        >
          <Printer class="w-4 h-4" />
          <span>Export PDF</span>
        </button>

        <button
          v-if="empData && prediction"
          @click="saveScanToDatabase"
          :disabled="savingScan"
          class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 text-xs disabled:opacity-50 cursor-pointer"
        >
          <Save class="w-4 h-4" />
          <span>{{ savingScan ? 'Menyimpan...' : 'Simpan Scan Ke DB' }}</span>
        </button>

        <button
          @click="$router.push('/analytics')"
          class="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
        >
          ← Kembali
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="p-12 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
      <div class="animate-spin w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
      <p class="text-xs font-semibold text-slate-700">Mengkalkulasi diagnostik AI untuk karyawan...</p>
    </div>

    <div v-else-if="empData" class="space-y-6">
      <!-- Employee Profile & Risk Banner Card -->
      <div class="p-6 bg-slate-50 border rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5 shadow-xs"
        :class="{
          'border-rose-200 bg-rose-50/20': prediction.riskLevel === 'critical' || prediction.riskLevel === 'high',
          'border-amber-200 bg-amber-50/20': prediction.riskLevel === 'medium',
          'border-emerald-200 bg-emerald-50/20': prediction.riskLevel === 'low'
        }"
      >
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            {{ empData.firstName.charAt(0) }}
          </div>
          <div class="space-y-1">
            <h3 class="text-lg font-extrabold text-slate-900">{{ empData.firstName }} {{ empData.lastName || '' }}</h3>
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
              <span>{{ empData.departmentName || '-' }}</span>
              <span>·</span>
              <span>Jabatan: <strong class="text-slate-800">{{ empData.positionTitle || '-' }}</strong></span>
              <span>·</span>
              <span class="font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{{ empData.employeeCode }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-4 self-start md:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 w-full md:w-auto justify-between md:justify-end">
          <div class="text-right">
            <span class="text-xs font-bold text-slate-400 uppercase block">Skor Risiko Resign:</span>
            <div class="text-3xl font-extrabold font-mono"
              :class="{
                'text-rose-600': prediction.riskLevel === 'critical' || prediction.riskLevel === 'high',
                'text-amber-600': prediction.riskLevel === 'medium',
                'text-emerald-600': prediction.riskLevel === 'low'
              }"
            >
              {{ prediction.riskPercent }}%
            </div>
          </div>
          <span
            class="px-3 py-1 text-xs font-extrabold uppercase rounded-lg border shadow-2xs"
            :class="{
              'bg-rose-100 text-rose-700 border-rose-200': prediction.riskLevel === 'critical',
              'bg-rose-50 text-rose-600 border-rose-200': prediction.riskLevel === 'high',
              'bg-amber-50 text-amber-700 border-amber-200': prediction.riskLevel === 'medium',
              'bg-emerald-50 text-emerald-700 border-emerald-200': prediction.riskLevel === 'low'
            }"
          >
            {{ prediction.riskLevel }} Risk
          </span>
        </div>
      </div>

      <!-- GRID 4 PILAR AI INFLUENCE DIAGNOSTICS -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

        <!-- 1. Faktor Pemicu Utama (Explainable AI / Reasons - Chart View) -->
        <div class="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-xs flex flex-col justify-between dark:bg-slate-900 dark:border-slate-800">
          <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3 dark:border-slate-800">
            <BrainCircuit class="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h3 class="font-bold text-slate-900 text-sm dark:text-white">1. Faktor Pemicu Utama (Explainable AI)</h3>
              <p class="text-[11px] text-slate-400 dark:text-slate-500">Persentase dampak variabel (arahkan kursor ke batang chart untuk detail alasan).</p>
            </div>
          </div>

          <div v-if="prediction.primaryRiskFactors.length" class="h-56 relative w-full flex items-center justify-center">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
          <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Kondisi karyawan stabil &amp; tidak ada pemicu risiko signifikan.</div>
        </div>

        <!-- 2. Analisis Produktivitas & Beban Kerja -->
        <div class="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-xs">
          <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Activity class="w-5 h-5 text-violet-600" />
            <div>
              <h3 class="font-bold text-slate-900 text-sm">2. Analisis Produktivitas & Beban Kerja</h3>
              <p class="text-[11px] text-slate-400">Evaluasi efisiensi jam kerja, ketaatan kehadiran, dan risiko burnout.</p>
            </div>
          </div>

          <div class="space-y-3">
            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span class="font-semibold text-slate-600">Skor Produktivitas Terhitung:</span>
              <span class="font-extrabold font-mono text-base text-indigo-700">{{ prediction.productivityAnalysis?.score || 85 }}/100</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <span class="font-semibold text-slate-600">Status Beban Kerja:</span>
              <span class="font-bold px-2.5 py-1 rounded-lg text-xs"
                :class="{
                  'bg-rose-100 text-rose-700 border border-rose-200': prediction.productivityAnalysis?.status === 'Burnout Risk',
                  'bg-amber-100 text-amber-700 border border-amber-200': prediction.productivityAnalysis?.status === 'Overloaded',
                  'bg-emerald-100 text-emerald-700 border border-emerald-200': prediction.productivityAnalysis?.status === 'Optimal'
                }"
              >
                {{ prediction.productivityAnalysis?.status || 'Optimal' }}
              </span>
            </div>

            <div class="grid grid-cols-2 gap-3 text-xs pt-1">
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span class="text-slate-400 block text-[11px]">Total Lembur (90 Hari):</span>
                <strong class="text-slate-800 font-mono text-sm">{{ totalOvertime }} Jam</strong>
              </div>
              <div class="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
                <span class="text-slate-400 block text-[11px]">Total Terlambat (90 Hari):</span>
                <strong class="text-slate-800 font-mono text-sm">{{ totalLate }} Menit</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Identifikasi Kesenjangan Kompetensi (Gap) -->
        <div class="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-xs">
          <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Award class="w-5 h-5 text-amber-600" />
            <div>
              <h3 class="font-bold text-slate-900 text-sm">3. Kesenjangan Kompetensi (Competency Gap)</h3>
              <p class="text-[11px] text-slate-400">Identifikasi skill gap yang membutuhkan pelatihan atau pendampingan.</p>
            </div>
          </div>

          <div v-if="prediction.competencyGaps?.length" class="space-y-2.5">
            <div v-for="(gap, idx) in prediction.competencyGaps" :key="idx" class="p-3 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-1.5">
              <div class="flex items-center justify-between font-bold text-xs text-amber-900">
                <span>{{ gap.skill }}</span>
                <span class="text-[10px] bg-amber-100 px-2 py-0.5 rounded-md text-amber-800 font-mono">Gap: {{ gap.gapLevel }}</span>
              </div>
              <p class="text-xs text-slate-600 font-medium flex items-center gap-1">
                <span>Rekomendasi:</span>
                <strong class="text-slate-800">{{ gap.recommendation }}</strong>
              </p>
            </div>
          </div>
          <div v-else class="p-8 text-center text-slate-400 text-xs">Kompetensi karyawan telah memenuhi standar penuh.</div>
        </div>

        <!-- 4. Action Playbook & Tindakan HRD -->
        <div class="p-5 bg-white border border-slate-200/80 rounded-2xl space-y-4 shadow-xs">
          <div class="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Target class="w-5 h-5 text-emerald-600" />
            <div>
              <h3 class="font-bold text-slate-900 text-sm">4. Action Playbook & Rekomendasi HR</h3>
              <p class="text-[11px] text-slate-400">Rencana tindakan nyata untuk pencegahan turnover & peningkatan karir.</p>
            </div>
          </div>

          <div v-if="prediction.actionPlan?.length" class="space-y-2.5">
            <div v-for="(act, idx) in prediction.actionPlan" :key="idx" class="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
              <div class="flex items-center justify-between gap-3">
                <span class="font-bold text-slate-800">{{ act.title }}</span>
                <span
                  class="px-2.5 py-0.5 font-bold rounded-md text-[10px] uppercase shrink-0 border"
                  :class="{
                    'bg-rose-100 text-rose-700 border-rose-200': act.priority === 'Urgent',
                    'bg-amber-100 text-amber-700 border-amber-200': act.priority === 'High',
                    'bg-indigo-50 text-indigo-700 border-indigo-200': act.priority === 'Medium' || act.priority === 'Low'
                  }"
                >
                  Prioritas: {{ act.priority }}
                </span>
              </div>
              <p class="text-[11px] text-slate-500 font-mono flex items-center gap-1" v-if="act.reason">
                <span>↳ Alasan Diturunkan:</span>
                <strong class="text-indigo-600">{{ act.reason }}</strong>
              </p>
            </div>
          </div>
          <div v-else class="p-8 text-center text-slate-400 text-xs">Tidak ada tindakan perbaikan khusus yang diperlukan.</div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '@/api/axios';
import { predictEmployeeTurnover } from '@/services/rfEngine';
import {
  ArrowLeft,
  BrainCircuit,
  Activity,
  Award,
  Target,
  Save,
  Printer
} from 'lucide-vue-next';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const empData = ref(null);
const prediction = ref(null);
const totalOvertime = ref(0);
const totalLate = ref(0);

const chartData = computed(() => {
  if (!prediction.value || !prediction.value.primaryRiskFactors) {
    return { labels: [], datasets: [] };
  }

  const factors = prediction.value.primaryRiskFactors;
  const labels = factors.map(f => f.factor);
  const data = factors.map(f => (f.weight * 100).toFixed(0));
  const bgColors = factors.map(f => f.direction === 'decrease' ? '#10b981' : '#f43f5e');
  const borderColors = factors.map(f => f.direction === 'decrease' ? '#059669' : '#e11d48');

  return {
    labels,
    datasets: [
      {
        label: 'Dampak Risk (%)',
        data,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 8,
      }
    ]
  };
});

const chartOptions = computed(() => {
  return {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 11 },
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: (context) => {
            const factorObj = prediction.value?.primaryRiskFactors[context.dataIndex];
            const detail = factorObj?.detail || '';
            return [`Dampak: ${context.parsed.x}%`, `Alasan: ${detail}`];
          }
        }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 } },
        max: 100
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11, weight: '600' } }
      }
    }
  };
});

const exportToPdf = () => {
  window.print();
};

const savingScan = ref(false);

const saveScanToDatabase = async () => {
  if (!empData.value || !prediction.value) return;
  savingScan.value = true;
  try {
    const items = [{
      employeeId: empData.value.id,
      riskScore: prediction.value.riskScore,
      riskLevel: prediction.value.riskLevel,
      primaryRiskFactors: prediction.value.primaryRiskFactors,
    }];

    const targetPeriodId = route.query.periodId || null;
    await api.post('/analytics/scan', { items, periodId: targetPeriodId });
    alert(`Berhasil menyimpan/menimpa hasil scan AI untuk ${empData.value.firstName} pada database (Terikat Periode)!`);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal menyimpan hasil scan ke database');
  } finally {
    savingScan.value = false;
  }
};

const fetchDetailData = async () => {
  loading.value = true;
  const scanId = route.params.scanId;
  const empId = route.params.id;

  try {
    if (scanId) {
      // Direct load saved scan record from database
      const res = await api.get(`/analytics/scan/${scanId}`);
      const scanRecord = res.data.data;
      
      empData.value = {
        firstName: scanRecord.employeeName,
        employeeCode: scanRecord.employeeCode,
        departmentName: scanRecord.departmentName,
        positionTitle: scanRecord.positionTitle,
      };

      const riskPercent = Math.round(Number(scanRecord.riskScore) * 100);
      prediction.value = {
        riskScore: Number(scanRecord.riskScore),
        riskPercent,
        riskLevel: scanRecord.riskLevel,
        primaryRiskFactors: scanRecord.primaryRiskFactors || [],
        productivityAnalysis: { score: 82, status: 'Optimal' },
        competencyGaps: [
          { skill: 'Modul Evaluasi Kinerja', gapLevel: 'Sedang', recommendation: 'Penugasan Pelatihan Berkala' }
        ],
        actionPlan: (scanRecord.primaryRiskFactors || []).filter(f => f.direction === 'increase').map(f => ({
          type: 'recommendation',
          title: `Tindakan Perbaikan untuk ${f.factor}`,
          priority: f.weight >= 0.2 ? 'Urgent' : 'High',
          reason: `Diturunkan dari XAI Pemicu: ${f.factor} (${(f.weight * 100).toFixed(0)}% impact)`
        }))
      };

      if (!prediction.value.actionPlan.length) {
        prediction.value.actionPlan.push({
          type: 'general',
          title: 'Pemantauan Kinerja Berkala',
          priority: 'Low',
          reason: 'Kondisi karyawan terpindai stabil'
        });
      }
      return;
    }

    const [empRes, attendRes, evalRes, trainRes, surveyRes, promoRes, salaryRes] = await Promise.all([
      api.get('/employees', { params: { limit: 500 } }),
      api.get('/operational/attendances', { params: { limit: 1000 } }),
      api.get('/operational/evaluations', { params: { limit: 100 } }),
      api.get('/operational/employee-trainings', { params: { limit: 500 } }),
      api.get('/surveys'),
      api.get('/operational/promotions'),
      api.get('/operational/salary-histories'),
    ]);

    const targetEmp = empRes.data.data.find(e => String(e.id) === String(empId));
    if (!targetEmp) {
      alert('Karyawan tidak ditemukan');
      router.push('/analytics');
      return;
    }

    const attendancesList = attendRes.data.data || [];
    const evaluationsList = evalRes.data.data || [];
    const trainingsList = trainRes.data.data || [];
    const promotionsData = promoRes.data.data || [];
    const salaryHistoriesData = salaryRes.data.data || [];

    let responses = [];
    if (surveyRes.data.data && surveyRes.data.data.length > 0) {
      const activeSurveyId = surveyRes.data.data[0].id;
      try {
        const respRes = await api.get(`/surveys/${activeSurveyId}/responses`);
        responses = respRes.data.data?.responses || [];
      } catch (e) {}
    }

    // Process Age & Tenure
    const now = new Date();
    let age = 30;
    if (targetEmp.birthDate) {
      const bDate = new Date(targetEmp.birthDate);
      age = now.getFullYear() - bDate.getFullYear();
    }

    let tenureMonths = 12;
    if (targetEmp.hireDate) {
      const hDate = new Date(targetEmp.hireDate);
      tenureMonths = (now.getFullYear() - hDate.getFullYear()) * 12 + (now.getMonth() - hDate.getMonth());
      if (tenureMonths < 1) tenureMonths = 1;
    }

    const trainingCount = trainingsList.filter(t => t.employeeId === targetEmp.id).length;
    const promotionsCount = promotionsData.filter(p => p.employeeId === targetEmp.id).length;
    const empSalaries = salaryHistoriesData.filter(s => s.employeeId === targetEmp.id);
    const lastSalaryIncrementPct = empSalaries.length > 0 ? Number(empSalaries[0].incrementPercentage || 0) : 5;
    const empSurvey = responses.find(r => r.employeeId === targetEmp.id);
    const jobSatisfaction = empSurvey ? Number(empSurvey.jobSatisfactionScore || 3) : 3;
    const envSatisfaction = empSurvey ? Number(empSurvey.workEnvironmentScore || 3) : 3;
    const worklifeBalance = empSurvey ? Number(empSurvey.workLifeBalanceScore || 3) : 3;

    // Filter Attendance 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const empAttend = attendancesList.filter(a => {
      if (String(a.employeeId) !== String(targetEmp.id)) return false;
      if (!a.date) return false;
      return new Date(a.date) >= ninetyDaysAgo;
    });

    totalOvertime.value = empAttend.reduce((s, a) => s + parseFloat(a.overtimeHours || 0), 0);
    totalLate.value = empAttend.reduce((s, a) => s + parseInt(a.lateMinutes || 0), 0);

    const empEval = evaluationsList.find(e => String(e.employeeId) === String(targetEmp.id)) || {};

    const inputFeatures = {
      age,
      tenure_months: tenureMonths,
      current_salary: Number(targetEmp.currentSalary || 8000000),
      salary_increment_pct: lastSalaryIncrementPct,
      overtime_hours: totalOvertime.value,
      late_minutes: totalLate.value,
      leave_days: 2,
      kpi_score: Number(empEval.kpiScore || 75),
      workload_score: Number(empEval.workloadScore || 5),
      gender: targetEmp.gender || 'male',
      maritalStatus: targetEmp.maritalStatus || 'Single',
      env_satisfaction: envSatisfaction,
      worklife_balance: worklifeBalance,
      training_count: trainingCount,
      promotions_count: promotionsCount,
      job_satisfaction: jobSatisfaction,
    };

    prediction.value = predictEmployeeTurnover(inputFeatures);
    empData.value = targetEmp;

  } catch (err) {
    console.error('Error loading AI detail page:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDetailData();
});
</script>

<style>
@media print {
  aside, header, footer, button {
    display: none !important;
  }
  body, html, main, div {
    overflow: visible !important;
    height: auto !important;
    max-height: none !important;
  }
  body {
    background-color: #ffffff !important;
    color: #000000 !important;
  }
  .shadow-xs, .shadow-md, .shadow-2xs, .shadow-lg {
    box-shadow: none !important;
  }
  .grid {
    display: block !important;
  }
  .grid > div {
    margin-bottom: 1.5rem !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }
}
</style>
