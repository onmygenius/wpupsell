<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleLogin() {
  if (!email.value || !password.value) {
    error.value = 'Please fill in all fields';
    return;
  }

  loading.value = true;
  error.value = '';

  const result = await authStore.login(email.value, password.value);

  if (!result.success) {
    error.value = result.error || 'Login failed';
  }

  loading.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0e27] flex items-center justify-center px-4">
    <div class="max-w-md w-full">
      <!-- Logo -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-white mb-2">UpSell AI</h1>
        <p class="text-gray-400">AI-Powered Recommendations for WooCommerce</p>
      </div>

      <!-- Login Card -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-8">
        <h2 class="text-2xl font-bold text-white mb-6">Welcome Back</h2>

        <!-- Error Message -->
        <div v-if="error" class="mb-4 p-3 bg-red-600/20 border border-red-600/50 rounded-lg text-red-400 text-sm">
          {{ error }}
        </div>

        <form @submit.prevent="handleLogin" class="space-y-4">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-400 mb-2">
              Email
            </label>
            <input
              id="email"
              v-model="email"
              type="email"
              required
              class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-400 mb-2">
              Password
            </label>
            <input
              id="password"
              v-model="password"
              type="password"
              required
              class="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <!-- Forgot Password -->
          <div class="text-right">
            <router-link to="/forgot-password" class="text-sm text-blue-400 hover:text-blue-300">
              Forgot password?
            </router-link>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!loading">Sign In</span>
            <span v-else>Signing in...</span>
          </button>
        </form>

        <!-- Info -->
        <div class="mt-6 text-center">
          <p class="text-sm text-gray-400">
            Your account is created automatically when you install the WordPress plugin.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 text-center text-sm text-gray-500">
        <p>© 2025 UpSell AI. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>
