<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const email = ref('');
const loading = ref(false);
const message = ref('');
const error = ref('');

async function resetPassword() {
  if (!email.value) {
    error.value = 'Please enter your email';
    return;
  }

  loading.value = true;
  error.value = '';
  message.value = '';

  try {
    const response = await fetch('https://wpupsell-dashboard.vercel.app/api/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    });

    const data = await response.json();

    if (data.success) {
      message.value = 'A new password has been sent to your email!';
      email.value = '';
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } else {
      error.value = data.error || 'Failed to reset password';
    }
  } catch (err) {
    error.value = 'Something went wrong. Please try again.';
    console.error('Reset password error:', err);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0e27] flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
          <span class="text-3xl">🚀</span>
        </div>
        <h1 class="text-3xl font-bold text-white mb-2">Reset Password</h1>
        <p class="text-gray-400">Enter your email to receive a new password</p>
      </div>

      <!-- Form -->
      <div class="bg-[#0f1535] rounded-2xl border border-gray-800 p-8">
        <!-- Success Message -->
        <div v-if="message" class="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p class="text-green-400 text-sm">{{ message }}</p>
        </div>

        <!-- Error Message -->
        <div v-if="error" class="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <p class="text-red-400 text-sm">{{ error }}</p>
        </div>

        <form @submit.prevent="resetPassword" class="space-y-6">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="w-full px-4 py-3 bg-[#0a0e27] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading">Sending...</span>
            <span v-else>Send New Password</span>
          </button>
        </form>

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <router-link
            to="/login"
            class="text-sm text-blue-400 hover:text-blue-300 transition"
          >
            ← Back to Login
          </router-link>
        </div>
      </div>

      <!-- Info -->
      <div class="mt-6 text-center text-sm text-gray-500">
        <p>You'll receive an email with your new password.</p>
        <p class="mt-1">Please change it after logging in.</p>
      </div>
    </div>
  </div>
</template>
