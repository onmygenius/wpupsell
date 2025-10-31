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
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🏪</span>
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            +12%
          </span>
        </div>
        <p class="text-sm font-medium text-gray-600 mb-1">Total Stores</p>
        <p class="text-3xl font-bold text-gray-900">{{ stats.totalStores }}</p>
        <p class="text-xs text-gray-500 mt-2">↑ 2 new this week</p>
      </div>

      <!-- Total Revenue -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <span class="text-2xl">💰</span>
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            +25%
          </span>
        </div>
        <p class="text-sm font-medium text-gray-600 mb-1">Upsell Revenue</p>
        <p class="text-3xl font-bold text-gray-900">${{ stats.totalRevenue.toLocaleString() }}</p>
        <p class="text-xs text-gray-500 mt-2">↑ $2.4k from last month</p>
      </div>

      <!-- Conversion Rate -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
            <span class="text-2xl">📈</span>
          </div>
          <span class="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            +5%
          </span>
        </div>
        <p class="text-sm font-medium text-gray-600 mb-1">Conversion Rate</p>
        <p class="text-3xl font-bold text-gray-900">{{ stats.conversionRate }}%</p>
        <p class="text-xs text-gray-500 mt-2">↑ 1.2% from last week</p>
      </div>

      <!-- Active Recommendations -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
            <span class="text-2xl">🤖</span>
          </div>
          <span class="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            Active
          </span>
        </div>
        <p class="text-sm font-medium text-gray-600 mb-1">AI Recommendations</p>
        <p class="text-3xl font-bold text-gray-900">{{ stats.activeRecommendations }}</p>
        <p class="text-xs text-gray-500 mt-2">Across all stores</p>
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

    <!-- Recent Activity & Quick Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-gray-900">Recent Activity</h2>
          <button class="text-sm text-blue-600 hover:text-blue-700 font-medium">View all</button>
        </div>
        
        <div class="space-y-4">
          <!-- Activity Item -->
          <div class="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-lg">✅</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">New sale completed</p>
              <p class="text-xs text-gray-500 mt-1">Order #1234 completed with upsell</p>
              <p class="text-xs text-gray-400 mt-1">2 min ago</p>
            </div>
            <span class="text-sm font-semibold text-green-600">+$45</span>
          </div>

          <div class="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-lg">👤</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">New user registered</p>
              <p class="text-xs text-gray-500 mt-1">john.doe@email.com joined</p>
              <p class="text-xs text-gray-400 mt-1">5 min ago</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-lg">🎯</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">AI recommendation accepted</p>
              <p class="text-xs text-gray-500 mt-1">Customer added suggested product</p>
              <p class="text-xs text-gray-400 mt-1">10 min ago</p>
            </div>
          </div>

          <div class="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-lg">⚙️</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">System maintenance</p>
              <p class="text-xs text-gray-500 mt-1">Scheduled backup completed</p>
              <p class="text-xs text-gray-400 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="space-y-6">
        <!-- Performance -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Conversion Rate</span>
                <span class="text-sm font-semibold text-gray-900">32%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 32%"></div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Bounce Rate</span>
                <span class="text-sm font-semibold text-gray-900">45%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-orange-500 h-2 rounded-full" style="width: 45%"></div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-600">Page Views</span>
                <span class="text-sm font-semibold text-gray-900">87%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" style="width: 87%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Products</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">iPhone 15 Pro</span>
              <span class="text-sm font-semibold text-gray-900">$524</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">MacBook Air M2</span>
              <span class="text-sm font-semibold text-gray-900">$999</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">AirPods Pro</span>
              <span class="text-sm font-semibold text-gray-900">$177</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">iPad Air</span>
              <span class="text-sm font-semibold text-gray-900">$1413</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
