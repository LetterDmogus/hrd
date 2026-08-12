<script setup>
import { computed, ref, onMounted } from 'vue';
import { ClipboardList, Eye } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import api from '../api/axios';
import AdminCrudView from '../components/admin/AdminCrudView.vue';
import Modal from '../components/ui/Modal.vue';

const auth = useAuthStore();
const canManage = computed(() => ['superadmin', 'admin_ti', 'hr'].includes(auth.userRole));
const showResponses = ref(false);
const selectedSurvey = ref(null);
const responses = ref([]);
const loadingResponses = ref(false);
const showRecycleBin = ref(false);
const deletedSurveys = ref([]);
const periodsList = ref([]);

const fetchPeriods = async () => {
  try {
    const res = await api.get('/analytics/periods');
    periodsList.value = res.data.data || [];
  } catch (err) {
    console.error(err);
  }
};

onMounted(fetchPeriods);

const columns = [
  { key: 'title', label: 'Judul Survey' },
  { key: 'periodCode', label: 'Periode', format: (val, row) => row.periodCode ? `${row.periodCode} - ${row.periodName || ''}` : '-' },
  { key: 'isAnonymous', label: 'Anonim', format: value => value ? 'Ya' : 'Tidak' },
  { key: 'isActive', label: 'Status', type: 'status', format: value => value ? 'Aktif' : 'Nonaktif', statusClass: row => row.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30' : 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' },
  { key: 'responseCount', label: 'Responden', align: 'right' },
];

const fields = computed(() => [
  { key: 'title', label: 'Judul Survey', required: true, placeholder: 'Survey Kepuasan Karyawan' },
  {
    key: 'periodId',
    label: 'Periode Evaluasi',
    type: 'select',
    required: true,
    options: periodsList.value.map(p => ({ value: p.id, label: `${p.periodCode} - ${p.name}` }))
  },
  { key: 'isAnonymous', label: 'Survey Anonim', type: 'checkbox', checkboxLabel: 'Sembunyikan identitas responden' },
  { key: 'isActive', label: 'Status Survey', type: 'checkbox', checkboxLabel: 'Survey aktif dan dapat diisi' },
]);

const openResponses = async survey => {
  selectedSurvey.value = survey; showResponses.value = true; loadingResponses.value = true;
  try { responses.value = (await api.get(`/surveys/${survey.id}/responses`)).data.data.responses; }
  catch (err) { alert(err.response?.data?.message || 'Gagal memuat responden'); }
  finally { loadingResponses.value = false; }
};
const openRecycleBin = async () => { try { deletedSurveys.value = (await api.get('/surveys/recycle-bin')).data.data; showRecycleBin.value = true; } catch (err) { alert(err.response?.data?.message || 'Gagal memuat recycle bin'); } };
const restoreSurvey = async survey => { try { await api.post(`/surveys/${survey.id}/restore`); deletedSurveys.value = deletedSurveys.value.filter(item => item.id !== survey.id); } catch (err) { alert(err.response?.data?.message || 'Gagal memulihkan survey'); } };
const permanentlyDeleteSurvey = async survey => { if (!confirm(`Hapus permanen survey "${survey.title}" beserta seluruh jawabannya?`)) return; try { await api.delete(`/surveys/${survey.id}/permanent`); deletedSurveys.value = deletedSurveys.value.filter(item => item.id !== survey.id); } catch (err) { alert(err.response?.data?.message || 'Gagal menghapus permanen survey'); } };
</script>

<template>
  <Transition name="page-swap" mode="out-in">
    <div v-if="!showRecycleBin" key="active" class="space-y-1">
      <div class="flex justify-end mb-3"><button v-if="canManage" @click="openRecycleBin" class="px-3 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800">Recycle Bin</button></div>
      <AdminCrudView resource-label="Survey" endpoint="/surveys" :columns="columns" :fields="fields"
    :initial-form="{ title: '', periodId: '', isAnonymous: false, isActive: true }"
    search-placeholder="Cari judul atau periode..." add-label="Tambah Survey" loading-text="Memuat data survey..."
    empty-text="Belum ada survey." :can-manage="canManage">
    <template #row-actions="{ row }"><button v-if="canManage" @click="openResponses(row)"
        class="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10"
        title="Lihat responden">
        <Eye class="w-4 h-4" />
      </button></template>
      </AdminCrudView>
    </div>
    <div v-else key="recycle" class="space-y-5">
      <div class="flex items-center justify-between"><div><h2 class="text-base font-bold text-slate-900 dark:text-white">Recycle Bin Survey</h2><p class="text-xs text-slate-500 mt-1 dark:text-slate-400">Survey yang dihapus dapat dipulihkan.</p></div><button @click="showRecycleBin = false" class="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-200 transition dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">← Kembali ke Survey</button></div>
      <div class="bg-slate-50 border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs dark:bg-slate-900 dark:border-slate-800"><div v-if="deletedSurveys.length" class="overflow-x-auto"><table class="w-full text-left text-xs"><thead class="text-xs font-semibold uppercase tracking-wider text-slate-400 bg-white border-b border-slate-200 dark:text-slate-500 dark:bg-slate-800 dark:border-slate-800"><tr><th class="py-3 px-4">Judul Survey</th><th class="py-3 px-4">Periode</th><th class="py-3 px-4">Dihapus Pada</th><th class="py-3 px-4 text-right">Aksi</th></tr></thead><tbody class="divide-y divide-slate-200/60 dark:divide-slate-800"><tr v-for="survey in deletedSurveys" :key="survey.id" class="hover:bg-white transition dark:hover:bg-slate-800/40"><td class="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{{ survey.title }}</td><td class="py-3 px-4 text-slate-600 dark:text-slate-400">{{ survey.period }}</td><td class="py-3 px-4 text-slate-500 dark:text-slate-500">{{ new Date(survey.deletedAt).toLocaleDateString('id-ID') }}</td><td class="py-3 px-4 text-right space-x-1"><button @click="restoreSurvey(survey)" class="px-3 py-1.5 text-xs text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20">Pulihkan</button><button @click="permanentlyDeleteSurvey(survey)" class="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20">Hapus Permanen</button></td></tr></tbody></table></div><div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Recycle bin kosong.</div></div>
    </div>
  </Transition>
  <Modal :open="showResponses" :title="`Responden: ${selectedSurvey?.title || ''}`" @close="showResponses = false">
    <div v-if="loadingResponses" class="p-6 text-center text-slate-400 text-xs dark:text-slate-500">Memuat responden...</div>
    <div v-else-if="responses.length" class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="border-b border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500">
            <th class="py-2">Responden</th>
            <th class="py-2">Kepuasan</th>
            <th class="py-2">Lingkungan</th>
            <th class="py-2">Work-life</th>
            <th class="py-2">Tanggal</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="response in responses" :key="response.id" class="border-b border-slate-100 text-slate-900 dark:border-slate-800 dark:text-slate-200">
            <td class="py-2 font-medium">{{ selectedSurvey.isAnonymous ? 'Anonim' : response.employeeName }}</td>
            <td class="py-2">{{ response.jobSatisfactionScore }}/5</td>
            <td class="py-2">{{ response.workEnvironmentScore }}/5</td>
            <td class="py-2">{{ response.workLifeBalanceScore }}/5</td>
            <td class="py-2">{{ new Date(response.submittedAt).toLocaleDateString('id-ID') }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="p-6 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada yang mengisi survey ini.</div>
  </Modal>
</template>

<style scoped>
.page-swap-enter-active, .page-swap-leave-active { transition: opacity .22s ease, transform .22s ease; }
.page-swap-enter-from { opacity: 0; transform: translateX(18px); }
.page-swap-leave-to { opacity: 0; transform: translateX(-18px); }
</style>
