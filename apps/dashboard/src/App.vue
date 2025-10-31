<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from './firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const isConnected = ref(false);
const loading = ref(true);

onMounted(async () => {
  try {
    // Test Firestore connection
    const testCollection = collection(db, 'stores');
    await getDocs(testCollection);
    isConnected.value = true;
  } catch (error) {
    console.error('Firebase connection error:', error);
    isConnected.value = false;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-2xl w-full">
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            🚀 WPUpsell Dashboard
          </h1>
          <p class="text-gray-600">
            AI-Powered Upsell & Cross-sell for WooCommerce
          </p>
        </div>

        <!-- Status Card -->
        <div class="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-blue-100 text-sm mb-1">System Status</p>
              <p class="text-2xl font-bold">
                {{ loading ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected' }}
              </p>
            </div>
            <div class="text-5xl">
              {{ loading ? '⏳' : isConnected ? '✅' : '❌' }}
            </div>
          </div>
        </div>

        <!-- Services Status -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-3xl mb-2">🔥</div>
            <p class="text-sm font-semibold text-gray-700">Firebase</p>
            <p class="text-xs text-gray-500">{{ isConnected ? 'Active' : 'Inactive' }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-3xl mb-2">⚡</div>
            <p class="text-sm font-semibold text-gray-700">Vercel API</p>
            <p class="text-xs text-gray-500">Pending</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 text-center">
            <div class="text-3xl mb-2">🤖</div>
            <p class="text-sm font-semibold text-gray-700">Groq AI</p>
            <p class="text-xs text-gray-500">Pending</p>
          </div>
        </div>

        <!-- Info -->
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-800">
            <strong>✨ Dashboard is ready!</strong> Firebase connection {{ isConnected ? 'successful' : 'failed' }}.
            Next steps: Build API endpoints and WooCommerce plugin.
          </p>
        </div>

        <!-- Version -->
        <div class="text-center mt-6 text-xs text-gray-400">
          v0.1.0 - Development Mode
        </div>
      </div>
    </div>
  </div>
</template>
