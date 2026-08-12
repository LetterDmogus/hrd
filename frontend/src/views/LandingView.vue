<template>
  <div class="min-h-screen bg-white text-slate-900 relative overflow-x-hidden">
    <!-- Star Rain Canvas Background -->
    <canvas ref="starCanvas" class="fixed inset-0 pointer-events-none z-0"></canvas>

    <!-- Ambient Background Glows (matching Login page) -->
    <div class="fixed -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none z-0"></div>
    <div class="fixed top-1/2 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none z-0"></div>
    <div class="fixed -bottom-32 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none z-0"></div>

    <!-- Navigation Header (Balanced padding: px-8 sm:px-16 lg:px-24, py-6) -->
    <header class="relative z-20 w-full px-8 sm:px-16 lg:px-24 py-6 flex items-center justify-between">
      <!-- Plain Brand Name without Box/Logo -->
      <span class="font-black text-2xl tracking-tight text-slate-900">KnowHR</span>

      <!-- Center Navbar Links -->
      <nav class="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
        <a href="#fitur" class="hover:text-indigo-600 transition">Fitur</a>
        <a href="#solusi" class="hover:text-indigo-600 transition">Solusi</a>
        <a href="#tentang" class="hover:text-indigo-600 transition">Tentang</a>
      </nav>

      <!-- Right Action Button: Rounded Capsule -->
      <div class="flex items-center gap-4">
        <router-link
          to="/login"
          class="px-6 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/20 dark:shadow-black/40 transition duration-200 text-sm flex items-center gap-2"
        >
          <span>Masuk Dashboard</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </router-link>
      </div>
    </header>

    <!-- Hero Section (Restored vertical padding: pt-16 pb-24, comfortable horizontal padding) -->
    <section class="relative z-10 w-full px-8 sm:px-16 lg:px-24 pt-16 pb-24 flex flex-col justify-start">
      <div class="max-w-4xl space-y-6 reveal-bounce">
        <!-- Big Title (KnowHR) -->
        <h1 class="text-6xl sm:text-7xl lg:text-8xl font-black text-slate-900 tracking-tight leading-none">
          KnowHR
        </h1>

        <!-- Subtitle -->
        <p class="text-xl sm:text-2xl text-slate-600 font-normal leading-relaxed max-w-3xl">
          Solusi cerdas analitik sumber daya manusia & prediksi turnover karyawan secara presisi untuk keputusan HR yang lebih strategis.
        </p>

        <!-- CTA Buttons: Rounded Capsule style -->
        <div class="pt-4 flex flex-wrap gap-4 items-center">
          <router-link
            to="/login"
            class="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base rounded-full shadow-xl shadow-indigo-600/30 dark:shadow-black/40 transition duration-200 flex items-center gap-3"
          >
            <span>Mulai Sekarang</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </router-link>

          <a
            href="#fitur"
            class="px-8 py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-base rounded-full transition duration-200 flex items-center gap-2"
          >
            <span>Pelajari Fitur</span>
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- Scroll Section: Continuous Moving Infinite Marquee (Loop Ke Kanan) -->
    <section id="fitur" class="relative z-10 py-20 border-t border-slate-100 overflow-hidden">
      <div class="w-full px-8 sm:px-16 lg:px-24 mb-10 reveal-bounce">
        <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Fitur & Ekosistem Platform
        </h2>
        <p class="text-slate-600 text-lg mt-2">
          Geser otomatis untuk menjelajahi modul analitik SDM terkini.
        </p>
      </div>

      <!-- Infinite Marquee Track moving RIGHT -->
      <div class="flex w-full overflow-hidden select-none py-2 reveal-bounce">
        <div class="marquee-track flex gap-6 whitespace-nowrap">
          <!-- Duplicate set 1 -->
          <div
            v-for="(card, index) in featureCards"
            :key="'set1-' + index"
            class="w-[340px] shrink-0 bg-slate-100/60 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
          >
            <div class="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-6">
              <component :is="card.icon" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3 whitespace-normal">{{ card.title }}</h3>
            <p class="text-slate-600 text-sm leading-relaxed whitespace-normal">{{ card.description }}</p>
          </div>

          <!-- Duplicate set 2 (for seamless loop) -->
          <div
            v-for="(card, index) in featureCards"
            :key="'set2-' + index"
            class="w-[340px] shrink-0 bg-slate-100/60 backdrop-blur-xl border border-slate-200/80 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
          >
            <div class="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-6">
              <component :is="card.icon" class="w-6 h-6" />
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3 whitespace-normal">{{ card.title }}</h3>
            <p class="text-slate-600 text-sm leading-relaxed whitespace-normal">{{ card.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Additional Information Section -->
    <section id="solusi" class="relative z-10 w-full px-8 sm:px-16 lg:px-24 py-20 border-t border-slate-100">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-12 items-center max-w-6xl">
        <div class="space-y-4 reveal-bounce">
          <h2 class="text-3xl font-extrabold text-slate-900">Solusi Berbasis Data untuk Manajemen Talenta</h2>
          <p class="text-slate-600 text-base leading-relaxed">
            KnowHR membantu divisi Human Capital dalam mendeteksi pola ketidakpuasan, potensi burnout, serta menghitung indeks retensi tim sebelum terjadi kepindahan karyawan.
          </p>
        </div>
        <div class="bg-slate-100/60 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-md space-y-4 reveal-bounce">
          <div class="flex items-center gap-4">
            <div class="text-4xl font-black text-indigo-600">94%</div>
            <div class="text-sm font-medium text-slate-700">Akurasi Prediksi Turnover Karyawan</div>
          </div>
          <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div class="bg-indigo-600 h-full w-[94%]"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Us Section -->
    <section id="kontak" class="relative z-10 w-full px-8 sm:px-16 lg:px-24 py-20 border-t border-slate-100">
      <div class="max-w-6xl">
        <div class="mb-12 reveal-bounce">
          <h2 class="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Hubungi Kami (Contact Us)</h2>
          <p class="text-slate-600 text-base mt-2">Dapatkan konsultasi analitik HRD &amp; integrasi platform untuk perusahaan Anda.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 reveal-bounce">
            <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
              <MapPin class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-slate-900 text-sm">Alamat Kantor</h3>
            <p class="text-xs text-slate-600 leading-relaxed">{{ appSettings.companyAddress }}</p>
          </div>

          <div class="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 reveal-bounce">
            <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
              <Phone class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-slate-900 text-sm">Telepon / WhatsApp</h3>
            <p class="text-xs text-slate-600 font-mono">{{ appSettings.companyPhone }}</p>
          </div>

          <div class="p-6 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3 reveal-bounce">
            <div class="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
              <Mail class="w-5 h-5" />
            </div>
            <h3 class="font-bold text-slate-900 text-sm">Email Resmi</h3>
            <p class="text-xs text-slate-600 font-mono">{{ appSettings.companyEmail }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer id="tentang" class="relative z-10 border-t border-slate-100 py-8 px-8 sm:px-16 lg:px-24 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
      <div>
        <span class="font-bold text-slate-700">{{ appSettings.companyName }}</span> — {{ appSettings.copyrightText }}
      </div>
      <div class="flex items-center gap-4">
        <span>{{ appSettings.companyPhone }}</span>
        <span>•</span>
        <span>{{ appSettings.companyEmail }}</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, h } from 'vue';
import api from '../api/axios';
import { MapPin, Phone, Mail, TrendingUp } from 'lucide-vue-next';

const starCanvas = ref(null);
let animationFrameId = null;

const appSettings = ref({
  appName: 'KnowHR',
  companyName: 'PT KnowHR Platform Indonesia',
  companyAddress: 'Jl. Jendral Sudirman No. 45, Jakarta Selatan, 12190',
  companyPhone: '+62 21 555 1234',
  companyEmail: 'contact@knowhr.id',
  copyrightText: '© 2026 KnowHR Platform. All rights reserved.',
});

const fetchAppSettings = async () => {
  try {
    const res = await api.get('/system/settings');
    if (res.data.data) {
      appSettings.value = res.data.data;
    }
  } catch (err) {
    console.error('Failed to fetch settings:', err);
  }
};

// Icon Helpers
const IconChart = TrendingUp;

const IconUsers = {
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })
  ])
};

const IconDocument = {
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' })
  ])
};

const IconAcademic = {
  render: () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l9-5-9-5-9 5 9 5z' }),
    h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z' })
  ])
};

const featureCards = [
  {
    title: 'Analitik Prediksi Turnover',
    description: 'Algoritma AI canggih memprediksi risiko turnover karyawan lebih awal sehingga Anda dapat mengambil langkah retensi.',
    icon: IconChart
  },
  {
    title: 'Manajemen Karyawan & Divisi',
    description: 'Kelola struktur divisi, posisi jabatan, dan direktori karyawan dalam satu panel terpusat yang intuitif.',
    icon: IconUsers
  },
  {
    title: 'Survei Kepuasan & Pulse',
    description: 'Buat dan distribusikan survei kepuasan kerja untuk mengukur motivasi dan kenyamanan tim secara berkala.',
    icon: IconDocument
  },
  {
    title: 'Pelatihan & Skills Upskilling',
    description: 'Pantau program pengembangan skill dan modul pelatihan karyawan untuk meningkatkan kapabilitas tim.',
    icon: IconAcademic
  }
];

// Canvas Star Rain Animation Logic
const initStarRain = () => {
  const canvas = starCanvas.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const handleResize = () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };

  window.addEventListener('resize', handleResize);

  const numStars = 65;
  const stars = Array.from({ length: numStars }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    length: Math.random() * 80 + 20,
    speed: Math.random() * 3 + 1.5,
    opacity: Math.random() * 0.7 + 0.2,
    size: Math.random() * 1.5 + 0.5,
    angle: Math.PI / 4,
  }));

  const draw = () => {
    ctx.clearRect(0, 0, width, height);

    stars.forEach((star) => {
      ctx.beginPath();
      const endX = star.x + Math.cos(star.angle) * star.length;
      const endY = star.y + Math.sin(star.angle) * star.length;

      const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
      gradient.addColorStop(0, `rgba(99, 102, 241, 0)`);
      gradient.addColorStop(0.8, `rgba(99, 102, 241, ${star.opacity})`);
      gradient.addColorStop(1, `rgba(139, 92, 246, ${star.opacity * 1.2})`);

      ctx.strokeStyle = gradient;
      ctx.lineWidth = star.size;
      ctx.lineCap = 'round';
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      star.x += Math.cos(star.angle) * star.speed * 2;
      star.y += Math.sin(star.angle) * star.speed * 2;

      if (star.x > width + star.length || star.y > height + star.length) {
        star.x = Math.random() * width - width / 2;
        star.y = -star.length;
        star.speed = Math.random() * 3 + 1.5;
        star.opacity = Math.random() * 0.7 + 0.2;
      }
    });

    animationFrameId = requestAnimationFrame(draw);
  };

  draw();
};

let scrollObserver = null;

const initScrollBounceAnimation = () => {
  const elements = document.querySelectorAll('.reveal-bounce');
  scrollObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => scrollObserver.observe(el));
};

onMounted(() => {
  fetchAppSettings();
  initStarRain();
  initScrollBounceAnimation();
});

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  if (scrollObserver) scrollObserver.disconnect();
});
</script>

<style scoped>
@keyframes marquee-right {
  0% {
    transform: translateX(-50%);
  }
  100% {
    transform: translateX(0%);
  }
}

.marquee-track {
  animation: marquee-right 25s linear infinite;
}

.marquee-track:hover {
  animation-play-state: paused;
}

/* Scroll Reveal Bounce In Animation */
.reveal-bounce {
  opacity: 0;
  transform: translateY(40px) scale(0.95);
  transition: transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.7s ease-out;
  will-change: transform, opacity;
}

.reveal-bounce.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
