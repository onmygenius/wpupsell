<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { db } from '../firebase/config';
import { collection, getDocs } from 'firebase/firestore';

const isConnected = ref(false);
const loading = ref(true);
const stats = ref({
  totalStores: 0,
  totalRevenue: 0,
  conversionRate: 0,
  activeRecommendations: 0
});

onMounted(async () => {
  try {
    // Test Firestore connection
    const storesCollection = collection(db, 'stores');
    const snapshot = await getDocs(storesCollection);
    isConnected.value = true;
    stats.value.totalStores = snapshot.size;
  } catch (error) {
    console.error('Firebase connection error:', error);
    isConnected.value = false;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-gray-600 mt-1">Welcome back! Here's your overview.</p>
    </div>

    <!-- Connection Status -->
    <div v-if="loading" class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <p class="text-sm text-blue-800">⏳ Checking connection...</p>
    </div>

    <div v-else-if="!isConnected" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-sm text-red-800">❌ Firebase connection failed. Check console for errors.</p>
    </div>

    <div v-else class="bg-green-50 border border-green-200 rounded-lg p-4">
      <p class="text-sm text-green-800">✅ Connected to Firebase successfully!</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Stores -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Stores</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalStores }}</p>
          </div>
          <div class="text-4xl">🏪</div>
        </div>
        <p class="text-xs text-gray-500 mt-4">Connected WooCommerce stores</p>
      </div>

      <!-- Total Revenue -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Upsell Revenue</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">${{ stats.totalRevenue.toLocaleString() }}</p>
          </div>
          <div class="text-4xl">💰</div>
        </div>
        <p class="text-xs text-gray-500 mt-4">Generated this month</p>
      </div>

      <!-- Conversion Rate -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Conversion Rate</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.conversionRate }}%</p>
          </div>
          <div class="text-4xl">📈</div>
        </div>
        <p class="text-xs text-gray-500 mt-4">Average across all stores</p>
      </div>

      <!-- Active Recommendations -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Active Recommendations</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.activeRecommendations }}</p>
          </div>
          <div class="text-4xl">🤖</div>
        </div>
        <p class="text-xs text-gray-500 mt-4">AI-powered suggestions</p>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button class="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition">
          <span class="text-xl">➕</span>
          <span>Add New Store</span>
        </button>
        <button class="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition">
          <span class="text-xl">📊</span>
          <span>View Analytics</span>
        </button>
        <button class="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition">
          <span class="text-xl">⚙️</span>
          <span>Settings</span>
        </button>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
      <div class="text-center py-8 text-gray-500">
        <p class="text-4xl mb-2">📭</p>
        <p>No recent activity yet</p>
        <p class="text-sm mt-1">Connect a store to start tracking</p>
      </div>
    </div>
  </div>
</template>
