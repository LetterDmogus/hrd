<script setup>
import { onMounted, ref } from 'vue';
import api from '../api/axios';
import { CheckCircle2, ClipboardList } from 'lucide-vue-next';

const surveys = ref([]);
const loading = ref(true);
const active = ref(null);
const form = ref({ jobSatisfactionScore: 0, workEnvironmentScore: 0, workLifeBalanceScore: 0, feedbackText: '' });

const load = async () => {
  loading.value = true;
  try {
    surveys.value = (await api.get('/surveys')).data.data.filter(s => s.isActive);
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal memuat survey');
  } finally {
    loading.value = false;
  }
};

const submit = async () => {
  if (Object.values(form.value).slice(0, 3).some(score => !score)) return alert('Berikan nilai untuk semua pertanyaan');
  try {
    await api.post(`/surveys/${active.value.id}/responses`, form.value);
    alert('Jawaban survey berhasil dikirim!');
    active.value = null;
    form.value = { jobSatisfactionScore: 0, workEnvironmentScore: 0, workLifeBalanceScore: 0, feedbackText: '' };
    await load();
  } catch (err) {
    alert(err.response?.data?.message || 'Gagal mengirim survey');
  }
};

onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <div v-if="loading" class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Memuat data survey...</div>
    
    <div v-else-if="surveys.length" class="grid gap-4">
      <div v-for="survey in surveys" :key="survey.id" class="p-5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between dark:bg-slate-900 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2">
            <h2 class="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{{ survey.title }}</h2>
            <span v-if="survey.isSubmitted" class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center gap-1 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">
              <CheckCircle2 class="w-3 h-3" />
              Sudah Diisi
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1 dark:text-slate-400">
            Periode {{ survey.periodCode || '-' }} · {{ survey.isAnonymous ? 'Jawaban anonim' : 'Identitas terdaftar' }}
          </p>
        </div>

        <div>
          <button v-if="!survey.isSubmitted" @click="active = survey" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition">
            Isi Survey
          </button>
          <span v-else class="px-3 py-1.5 bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold cursor-not-allowed dark:bg-slate-800 dark:text-slate-400">
            Selesai
          </span>
        </div>
      </div>
    </div>

    <div v-else class="p-8 text-center text-slate-400 text-xs dark:text-slate-500">Belum ada survey aktif.</div>

    <!-- Form Modal survey -->
    <div v-if="active" class="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-lg dark:bg-slate-900 dark:border-slate-800">
      <div class="flex justify-between items-center border-b border-slate-100 pb-3 dark:border-slate-800">
        <h2 class="font-bold text-slate-900 dark:text-white text-sm">{{ active.title }}</h2>
        <button @click="active = null" class="text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">Tutup</button>
      </div>

      <div v-for="question in [{ key: 'jobSatisfactionScore', label: '1. Seberapa puas Anda dengan pekerjaan saat ini?' }, { key: 'workEnvironmentScore', label: '2. Bagaimana Anda menilai lingkungan kerja?' }, { key: 'workLifeBalanceScore', label: '3. Bagaimana keseimbangan kerja dan kehidupan Anda?' }]" :key="question.key" class="space-y-2">
        <p class="text-xs font-semibold text-slate-700 dark:text-slate-300">{{ question.label }}</p>
        <div class="flex gap-2">
          <button v-for="score in 5" :key="score" @click="form[question.key] = score" class="w-9 h-9 rounded-xl border text-xs font-bold transition" :class="form[question.key] === score ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' : 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'">
            {{ score }}
          </button>
        </div>
      </div>

      <div class="space-y-1">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300">Feedback Tambahan (Opsional)</label>
        <textarea v-model="form.feedbackText" placeholder="Masukkan masukan atau saran untuk perusahaan..." class="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-indigo-500 transition dark:bg-slate-800 dark:border-slate-700 dark:text-white"></textarea>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button @click="active = null" class="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400">Batal</button>
        <button @click="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition">Kirim Jawaban</button>
      </div>
    </div>
  </div>
</template>
