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
      <h1 class="text-3xl font-bold text-white">Dashboard</h1>
      <p class="text-gray-400 mt-1">Welcome back to your dashboard</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Total Sales -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
            <span class="text-xl">📊</span>
          </div>
          <span class="text-xs font-medium text-green-400">+23%</span>
        </div>
        <p class="text-sm text-gray-400 mb-1">Total Sales</p>
        <p class="text-2xl font-bold text-white">$24,567</p>
        <p class="text-xs text-green-400 mt-2">+23% from last month</p>
      </div>

      <!-- Active Users -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
            <span class="text-xl">👥</span>
          </div>
          <span class="text-xs font-medium text-red-400">-5%</span>
        </div>
        <p class="text-sm text-gray-400 mb-1">Active Users</p>
        <p class="text-2xl font-bold text-white">1,234</p>
        <p class="text-xs text-red-400 mt-2">-5% from last week</p>
      </div>

      <!-- Orders -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center">
            <span class="text-xl">🛒</span>
          </div>
          <span class="text-xs font-medium text-green-400">+8%</span>
        </div>
        <p class="text-sm text-gray-400 mb-1">Orders</p>
        <p class="text-2xl font-bold text-white">456</p>
        <p class="text-xs text-green-400 mt-2">+8% from yesterday</p>
      </div>

      <!-- Products -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-orange-600/20 rounded-lg flex items-center justify-center">
            <span class="text-xl">📦</span>
          </div>
          <span class="text-xs font-medium text-green-400">+4%</span>
        </div>
        <p class="text-sm text-gray-400 mb-1">Products</p>
        <p class="text-2xl font-bold text-white">89</p>
        <p class="text-xs text-green-400 mt-2">+4% than this week</p>
      </div>
    </div>


    <!-- Recent Activity & Quick Stats -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Activity -->
      <div class="lg:col-span-2 bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-white">Recent Activity</h2>
          <button class="text-sm text-blue-400 hover:text-blue-300 font-medium">View all</button>
        </div>
        
        <div class="space-y-4">
          <!-- Activity Item -->
          <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition">
            <div class="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">✅</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">New sale reported</p>
              <p class="text-xs text-gray-400 mt-1">Order #1234 completed</p>
            </div>
            <span class="text-xs text-gray-500">2 min ago</span>
          </div>

          <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition">
            <div class="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">👤</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">New user registered</p>
              <p class="text-xs text-gray-400 mt-1">john.doe@email.com joined</p>
            </div>
            <span class="text-xs text-gray-500">5 min ago</span>
          </div>

          <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition">
            <div class="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">📦</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">Product updated</p>
              <p class="text-xs text-gray-400 mt-1">iPhone 15 Pro stock updated</p>
            </div>
            <span class="text-xs text-gray-500">10 min ago</span>
          </div>

          <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition">
            <div class="w-10 h-10 bg-orange-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">⚙️</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">System maintenance</p>
              <p class="text-xs text-gray-400 mt-1">Scheduled backup completed</p>
            </div>
            <span class="text-xs text-gray-500">1 hour ago</span>
          </div>

          <div class="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-800/30 transition">
            <div class="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span class="text-lg">🔔</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-white">New notification</p>
              <p class="text-xs text-gray-400 mt-1">Multiple storage media</p>
            </div>
            <span class="text-xs text-gray-500">2 hours ago</span>
          </div>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="space-y-6">
        <!-- Performance -->
        <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Quick Stats</h3>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Conversion Rate</span>
                <span class="text-sm font-semibold text-white">3.2%</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 32%"></div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Bounce Rate</span>
                <span class="text-sm font-semibold text-white">45%</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div class="bg-orange-500 h-2 rounded-full" style="width: 45%"></div>
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Page Views</span>
                <span class="text-sm font-semibold text-white">8.7k</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" style="width: 87%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Products -->
        <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Top Products</h3>
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">iPhone 15 Pro</span>
              <span class="text-sm font-semibold text-white">$524</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">MacBook Air M2</span>
              <span class="text-sm font-semibold text-white">$999</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">AirPods Pro</span>
              <span class="text-sm font-semibold text-white">$1177</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-400">iPad Air</span>
              <span class="text-sm font-semibold text-white">$1413</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
