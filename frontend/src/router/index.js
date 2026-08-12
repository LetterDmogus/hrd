import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

import LandingView from '../views/LandingView.vue';
import LoginView from '../views/LoginView.vue';
import MainLayout from '../layouts/MainLayout.vue';
import DashboardView from '../views/DashboardView.vue';
import EmployeesView from '../views/EmployeesView.vue';
import AnalyticsView from '../views/AnalyticsView.vue';
import PositionView from '@/views/PositionView.vue';
import UserView from '@/views/UserView.vue';
import DepartmentView from '@/views/DepartmentView.vue';
import TrainingView from '@/views/TrainingView.vue';
import SurveyView from '@/views/SurveyView.vue';
import MySurveyView from '@/views/MySurveyView.vue';
import ProfileView from '@/views/ProfileView.vue';
import OperationalView from '@/views/OperationalView.vue';
import AnalyticsDetailView from '@/views/AnalyticsDetailView.vue';
import PeriodView from '@/views/PeriodView.vue';
import SalaryView from '@/views/SalaryView.vue';
import PromotionView from '@/views/PromotionView.vue';
import BackupResetView from '@/views/BackupResetView.vue';

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: LandingView,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: DashboardView,
        meta: { allowedRoles: ['superadmin', 'admin_ti', 'hr', 'manager'] }
      },
      {
        path: 'employees',
        name: 'Employees',
        component: EmployeesView,
      },
      {
        path: 'analytics',
        name: 'Analytics',
        component: AnalyticsView,
      },
      {
        path: 'analytics/scan/:scanId',
        name: 'AnalyticsScanDetail',
        component: AnalyticsDetailView,
      },
      {
        path: 'analytics/:id',
        name: 'AnalyticsDetail',
        component: AnalyticsDetailView,
      },
      {
        path: 'periods',
        name: 'Periods',
        component: PeriodView,
      },
      {
        path: 'positions',
        name: 'Positions',
        component: PositionView,
      },
      {
        path: 'users',
        name: 'Users',
        component: UserView,
      },
      {
        path: 'departments',
        name: 'Departments',
        component: DepartmentView,
      },
      {
        path: 'trainings',
        name: 'Trainings',
        component: TrainingView,
      },
      {
        path: 'surveys',
        name: 'Surveys',
        component: SurveyView,
      },
      { path: 'my-surveys', name: 'MySurveys', component: MySurveyView },
      { path: 'profile', name: 'Profile', component: ProfileView },
      { path: 'operational', name: 'Operational', component: OperationalView },
      { path: 'salary', name: 'Salary', component: SalaryView },
      { path: 'promotions', name: 'Promotions', component: PromotionView },
      { path: 'system/backup', name: 'BackupReset', component: BackupResetView },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    if (authStore.userRole === 'employee') {
      next('/my-surveys');
    } else {
      next('/dashboard');
    }
  } else if (to.meta.allowedRoles && !to.meta.allowedRoles.includes(authStore.userRole)) {
    // If employee tries to access dashboard or admin pages, redirect to my-surveys
    if (authStore.userRole === 'employee') {
      next('/my-surveys');
    } else {
      next('/dashboard');
    }
  } else {
    next();
  }
});

export default router;
