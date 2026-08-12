import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { useAuthStore } from './stores/auth';
import { useThemeStore } from './stores/theme';
import './style.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize Auth header & Theme from localStorage
const authStore = useAuthStore();
authStore.initAuth();

const themeStore = useThemeStore();
themeStore.initTheme();

app.mount('#app');
