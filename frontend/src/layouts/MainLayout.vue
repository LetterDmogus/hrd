<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex h-screen p-3 gap-3 overflow-hidden font-sans transition-colors duration-300">
    <!-- Toggleable Sidebar -->
    <aside
      class="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-col justify-between shrink-0 shadow-xs transition-all duration-500 ease-bounce relative z-20"
      :class="isCollapsed ? 'w-16 p-3' : 'w-52 p-4'"
    >
      <div class="space-y-5 overflow-x-hidden overflow-y-auto">
        <!-- Brand Header & Toggle Button -->
        <div class="flex items-center h-9" :class="isCollapsed ? 'justify-center gap-1' : 'justify-between px-1'">
          <!-- Dynamic App Name (hidden when collapsed, truncation supported for long names) -->
          <span
            v-if="!isCollapsed"
            class="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white truncate max-w-[110px]"
            :title="appSettings.appName"
          >
            {{ appSettings.appName }}
          </span>

          <div class="flex items-center gap-1 shrink-0">
            <!-- Theme Switcher: icon only (Hidden when sidebar is collapsed to avoid collision) -->
            <button
              v-if="!isCollapsed"
              @click="themeStore.toggleTheme"
              class="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition flex items-center justify-center"
              :title="themeStore.isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'"
              :aria-label="themeStore.isDark ? 'Ganti ke Light Mode' : 'Ganti ke Dark Mode'"
            >
              <Sun v-if="themeStore.isDark" class="w-5 h-5 text-amber-400" />
              <Moon v-else class="w-5 h-5 text-indigo-600" />
            </button>

            <!-- Sidebar Collapse Toggle Button -->
            <button
              @click="isCollapsed = !isCollapsed; showFlyoutMenu = false"
              class="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition shrink-0 flex items-center justify-center"
              :title="isCollapsed ? 'Buka Sidebar' : 'Tutup Sidebar'"
            >
              <PanelLeftOpen v-if="isCollapsed" class="w-5 h-5" />
              <PanelLeftClose v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="space-y-1.5 relative">
          <!-- Standalone Menu 1: Dashboard (Admin & Manager Only) -->
          <router-link
            v-if="['superadmin', 'admin_ti', 'hr', 'manager'].includes(authStore.userRole)"
            to="/dashboard"
            @click="showFlyoutMenu = false"
            class="flex items-center py-2.5 rounded-xl text-sm font-medium transition"
            :class="[
              $route.path === '/dashboard' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            ]"
            :title="isCollapsed ? 'Dashboard' : ''"
          >
            <LayoutDashboard class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="truncate">Dashboard</span>
          </router-link>

          <!-- CATEGORY GROUP: Kelola Data (Admin & HR Only) -->
          <!-- MODE A: Expanded Sidebar (Accordion) -->
          <div v-if="!isCollapsed && ['superadmin', 'admin_ti', 'hr'].includes(authStore.userRole)" class="pt-2">
            <!-- Group Header -->
            <button
              @click="isDataMenuOpen = !isDataMenuOpen"
              class="w-full flex items-center justify-between px-2 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 transition rounded-lg"
            >
              <span class="flex items-center gap-1.5">
                <Database class="w-3.5 h-3.5 text-indigo-500" />
                Kelola Data
              </span>
              <ChevronDown
                class="w-3.5 h-3.5 transition-transform duration-300"
                :class="isDataMenuOpen ? 'rotate-180' : ''"
              />
            </button>

            <!-- Group Child Items in Expanded Sidebar -->
            <div v-show="isDataMenuOpen" class="space-y-1 mt-1 transition-all duration-300">
              <router-link
                to="/employees"
                class="flex items-center gap-3 px-3 pl-4 py-2.5 rounded-xl text-sm font-medium transition"
                :class="$route.path === '/employees' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
              >
                <Users class="w-5 h-5 shrink-0" />
                <span class="truncate">Karyawan</span>
              </router-link>

              <router-link
                to="/positions"
                class="flex items-center gap-3 px-3 pl-4 py-2.5 rounded-xl text-sm font-medium transition"
                :class="$route.path === '/positions' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
              >
                <Briefcase class="w-5 h-5 shrink-0" />
                <span class="truncate">Jabatan</span>
              </router-link>

              <router-link
                to="/users"
                class="flex items-center gap-3 px-3 pl-4 py-2.5 rounded-xl text-sm font-medium transition"
                :class="$route.path === '/users' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
              >
                <User class="w-5 h-5 shrink-0" />
                <span class="truncate">Users</span>
              </router-link>

              <router-link
                to="/departments"
                class="flex items-center gap-3 px-3 pl-4 py-2.5 rounded-xl text-sm font-medium transition"
                :class="$route.path === '/departments' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
              >
                <Building class="w-5 h-5 shrink-0" />
                <span class="truncate">Departments</span>
              </router-link>

              <router-link
                to="/periods"
                class="flex items-center gap-3 px-3 pl-4 py-2.5 rounded-xl text-sm font-medium transition"
                :class="$route.path === '/periods' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
              >
                <Calendar class="w-5 h-5 shrink-0" />
                <span class="truncate">Periode Evaluasi</span>
              </router-link>

              <router-link
                to="/trainings"
                class="flex items-center gap-3 px-3 pl-4 py-2.5 rounded-xl text-sm font-medium transition"
                :class="$route.path === '/trainings' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
              >
                <BookOpen class="w-5 h-5 shrink-0" />
                <span class="truncate">Trainings</span>
              </router-link>

              <router-link
                to="/surveys"
                class="flex items-center gap-3 px-3 pl-4 py-2.5 rounded-xl text-sm font-medium transition"
                :class="$route.path === '/surveys' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'"
              >
                <ClipboardList class="w-5 h-5 shrink-0" />
                <span class="truncate">Survey</span>
              </router-link>
            </div>
          </div>

          <!-- MODE B: Collapsed Sidebar (Single Floating Flyout Button) -->
          <div v-else-if="isCollapsed && ['superadmin', 'admin_ti', 'hr'].includes(authStore.userRole)" class="relative pt-1">
            <!-- Single Icon Button for Collapsed Mode -->
            <button
              @click="showFlyoutMenu = !showFlyoutMenu"
              class="w-full flex items-center justify-center py-2.5 rounded-xl transition relative"
              :class="[
                isChildRouteActive || showFlyoutMenu ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              ]"
              title="Kelola Data (Klik untuk menu)"
            >
              <Database class="w-5 h-5 shrink-0" />
              <!-- Sub-menu Indicator Dot -->
              <span class="absolute top-1.5 right-2 w-1.5 h-1.5 bg-indigo-400 rounded-full" v-if="!isChildRouteActive"></span>
            </button>

            <!-- Floating Popover Sub-menu (Appears on click when sidebar is collapsed) -->
            <Transition name="flyout">
              <div
                v-if="showFlyoutMenu"
                class="fixed left-20 top-24 bg-white border border-slate-200 shadow-2xl rounded-2xl p-2 z-50 w-48 space-y-1 font-sans"
              >
                <div class="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1 flex items-center justify-between">
                  <span>Kelola Data</span>
                  <Database class="w-3.5 h-3.5 text-indigo-500" />
                </div>

                <router-link
                  to="/employees"
                  @click="showFlyoutMenu = false"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  :class="$route.path === '/employees' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                >
                  <Users class="w-4 h-4 shrink-0" />
                  <span>Karyawan</span>
                </router-link>

                <router-link
                  to="/positions"
                  @click="showFlyoutMenu = false"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  :class="$route.path === '/positions' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                >
                  <Briefcase class="w-4 h-4 shrink-0" />
                  <span>Jabatan</span>
                </router-link>

                <router-link
                  to="/users"
                  @click="showFlyoutMenu = false"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  :class="$route.path === '/users' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                >
                  <User class="w-4 h-4 shrink-0" />
                  <span>Users</span>
                </router-link>

                <router-link
                  to="/departments"
                  @click="showFlyoutMenu = false"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  :class="$route.path === '/departments' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                >
                  <Building class="w-4 h-4 shrink-0" />
                  <span>Departments</span>
                </router-link>

                <router-link
                  to="/trainings"
                  @click="showFlyoutMenu = false"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  :class="$route.path === '/trainings' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                >
                  <BookOpen class="w-4 h-4 shrink-0" />
                  <span>Trainings</span>
                </router-link>

                <router-link
                  to="/surveys"
                  @click="showFlyoutMenu = false"
                  class="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition"
                  :class="$route.path === '/surveys' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'"
                >
                  <ClipboardList class="w-4 h-4 shrink-0" />
                  <span>Survey</span>
                </router-link>
              </div>
            </Transition>
          </div>

          <!-- Standalone Menu 2: Operasional HRD -->
          <router-link
            v-if="['superadmin', 'admin_ti', 'hr'].includes(authStore.userRole)"
            to="/operational"
            @click="showFlyoutMenu = false"
            class="flex items-center py-2.5 rounded-xl text-sm font-medium transition"
            :class="[
              $route.path === '/operational' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            ]"
            :title="isCollapsed ? 'Operasional HRD' : ''"
          >
            <CalendarCheck class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="truncate">Operasional HRD</span>
          </router-link>

          <!-- Standalone Menu: Riwayat Gaji -->
          <router-link
            v-if="['superadmin', 'admin_ti', 'hr'].includes(authStore.userRole)"
            to="/salary"
            @click="showFlyoutMenu = false"
            class="flex items-center py-2.5 rounded-xl text-sm font-medium transition"
            :class="[
              $route.path === '/salary' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            ]"
            :title="isCollapsed ? 'Riwayat Gaji' : ''"
          >
            <TrendingUp class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="truncate">Riwayat Gaji</span>
          </router-link>

          <!-- Standalone Menu: Promosi & Mutasi -->
          <router-link
            v-if="['superadmin', 'admin_ti', 'hr'].includes(authStore.userRole)"
            to="/promotions"
            @click="showFlyoutMenu = false"
            class="flex items-center py-2.5 rounded-xl text-sm font-medium transition"
            :class="[
              $route.path === '/promotions' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            ]"
            :title="isCollapsed ? 'Promosi & Mutasi' : ''"
          >
            <Award class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="truncate">Promosi & Mutasi</span>
          </router-link>

          <!-- Standalone Menu 3: Analisis AI -->
          <router-link
            v-if="['superadmin', 'admin_ti', 'hr', 'manager'].includes(authStore.userRole)"
            to="/analytics"
            @click="showFlyoutMenu = false"
            class="flex items-center py-2.5 rounded-xl text-sm font-medium transition"
            :class="[
              $route.path === '/analytics' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            ]"
            :title="isCollapsed ? 'Analisis AI' : ''"
          >
            <TrendingUp class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="truncate">Analisis AI</span>
          </router-link>
          
          <router-link to="/my-surveys" @click="showFlyoutMenu = false" class="flex items-center py-2.5 rounded-xl text-sm font-medium transition" :class="[$route.path === '/my-surveys' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900', isCollapsed ? 'justify-center px-0' : 'gap-3 px-3']" title="Survey Saya"><ClipboardList class="w-5 h-5 shrink-0" /><span v-if="!isCollapsed" class="truncate">Isi Survey</span></router-link>

          <!-- System Menu: Backup & Reset -->
          <router-link
            v-if="['superadmin', 'admin_ti'].includes(authStore.userRole)"
            to="/system/backup"
            @click="showFlyoutMenu = false"
            class="flex items-center py-2.5 rounded-xl text-sm font-medium transition"
            :class="[
              $route.path === '/system/backup' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-black/40' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
              isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
            ]"
            title="Backup & Reset"
          >
            <Database class="w-5 h-5 shrink-0" />
            <span v-if="!isCollapsed" class="truncate">Backup & Reset</span>
          </router-link>
        </nav>
      </div>

      <!-- Footer User Profile & Logout -->
      <div class="pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
        <div class="flex items-center" :class="isCollapsed ? 'justify-center' : 'justify-between'">
          <router-link v-if="!isCollapsed" to="/profile" class="truncate min-w-0 pr-2 text-left hover:opacity-75 transition">
            <span class="block text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{{ authStore.user?.email || 'User' }}</span>
            <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">{{ authStore.userRole }}</span>
          </router-link>

          <button
            @click="handleLogout"
            class="p-2 rounded-xl text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition shrink-0 flex items-center justify-center"
            title="Keluar"
          >
            <LogOut class="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>


    <!-- Main Content Area with Rounded Container -->
    <main class="flex-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-col min-w-0 overflow-hidden shadow-xs transition-colors duration-300">
      <!-- Minimalist Top Bar Header -->
      <header class="h-14 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h1 class="text-base font-bold text-slate-900 dark:text-white tracking-tight">
          {{ currentRouteTitle }}
        </h1>
        <span class="text-xs text-slate-400 dark:text-slate-500 font-medium truncate max-w-[200px]" :title="appSettings.appName">
          {{ appSettings.appName }} Platform
        </span>
      </header>

      <!-- Page Scrollable Body -->
      <div class="flex-1 overflow-y-auto p-6 flex flex-col justify-between" @click="showFlyoutMenu = false">
        <div class="flex-1">
          <router-view />
        </div>

        <!-- Footer Copyright -->
        <footer class="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 dark:text-slate-500 gap-2 shrink-0">
          <div>
            <span class="font-semibold text-slate-600 dark:text-slate-400">{{ appSettings.companyName }}</span> — {{ appSettings.copyrightText }}
          </div>
          <div class="flex items-center gap-3 text-[11px]">
            <span>{{ appSettings.companyPhone }}</span>
            <span>•</span>
            <span>{{ appSettings.companyEmail }}</span>
          </div>
        </footer>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useThemeStore } from '../stores/theme';
import api from '../api/axios';
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  User,
  Database,
  ChevronDown,
  Building,
  BookOpen,
  ClipboardList,
  CalendarCheck,
  Calendar,
  Award,
  Sun,
  Moon,
  BrainCircuit
} from 'lucide-vue-next';

const isCollapsed = ref(false);
const isDataMenuOpen = ref(true); // Accordion untuk sidebar terbuka
const showFlyoutMenu = ref(false); // Floating popover untuk sidebar ciut
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
  } catch (e) {
    console.error('Failed to load app settings:', e);
  }
};

onMounted(() => {
  fetchAppSettings();
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

const isChildRouteActive = computed(() => {
  return ['/employees', '/positions', '/users', '/departments', '/trainings', '/surveys'].includes(route.path);
});

const currentRouteTitle = computed(() => {
  switch (route.path) {
    case '/dashboard':
      return 'Dashboard';
    case '/employees':
      return 'Data Karyawan';
    case '/positions':
      return 'Data Jabatan';
    case '/users':
      return 'Data User';
    case '/departments':
      return 'Data Departemen';
    case '/periods':
      return 'Master Periode Evaluasi';
    case '/trainings':
      return 'Data Pelatihan';
    case '/surveys':
      return 'Survey Karyawan';
    case '/operational':
      return 'Operasional HRD';
    case '/salary':
      return 'Riwayat Gaji Karyawan';
    case '/promotions':
      return 'Promosi & Mutasi Karyawan';
    case '/system/backup':
      return 'Backup & Reset Database';
    case '/analytics':
      return 'Analisis AI & Turnover';
    case '/profile':
      return 'Edit Profil';
    default:
      if (route.path.startsWith('/analytics/')) return 'Detail Diagnostik AI';
      return 'KnowHR';
  }
});

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
/* Vue 3 Flyout Popover Transition */
.flyout-enter-active,
.flyout-leave-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.flyout-enter-from,
.flyout-leave-to {
  opacity: 0;
  transform: translateX(-10px) scale(0.95);
}
</style>
