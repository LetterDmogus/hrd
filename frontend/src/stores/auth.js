import { defineStore } from 'pinia';
import api from '../api/axios';


export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('knowhr_token') || null,
    user: JSON.parse(localStorage.getItem('knowhr_user') || 'null'),
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userRole: (state) => state.user?.roleName || 'guest',
  },

  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.post(`/auth/login`, {
          email,
          password,
        });

        const { token, user } = response.data.data;
        this.token = token;
        this.user = user;

        localStorage.setItem('knowhr_token', token);
        localStorage.setItem('knowhr_user', JSON.stringify(user));

        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Login gagal. Periksa email dan password.';
        return false;
      } finally {
        this.loading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('knowhr_token');
      localStorage.removeItem('knowhr_user');
    },

    initAuth() {
      if (this.token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    },
  },
});
