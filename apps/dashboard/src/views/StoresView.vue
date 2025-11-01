<script setup lang="ts">
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || 'https://wpupsell-dashboard.vercel.app/api';
const STORE_ID = 'store_fHg74QwLurg5';

const stores = ref<any[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    // Load products to get store stats
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', storeId: STORE_ID }),
    });
    
    const data = await response.json();
    
    // Load stats from conversions
    const statsResponse = await fetch(`${API_URL}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: STORE_ID }),
    });
    
    const statsData = await statsResponse.json();
    
    if (data.success) {
      // Create store object with real data
      stores.value = [{
        storeId: STORE_ID,
        name: 'Bijuteria Regala',
        url: 'https://bijuteriaregala.ro',
        apiKey: 'sk_live_***',
        plan: 'growth',
        status: 'active',
        userId: 'user_demo',
        createdAt: new Date('2025-11-01'),
        stats: {
          totalRevenue: statsData.success ? statsData.stats.totalRevenue : 0,
          upsellRevenue: statsData.success ? statsData.stats.totalRevenue : 0,
          conversions: statsData.success ? statsData.stats.conversions : 0,
          conversionRate: 0, // TODO: calculated from impressions
          totalProducts: data.products.length,
          currency: statsData.success ? statsData.stats.currency : 'LEI'
        }
      }];
    }
  } catch (error) {
    console.error('Failed to load stores:', error);
  } finally {
    loading.value = false;
  }
});

const getStatusColor = (status: string) => {
  switch(status) {
    case 'active': return 'bg-green-600/20 text-green-400';
    case 'trial': return 'bg-blue-600/20 text-blue-400';
    case 'cancelled': return 'bg-red-600/20 text-red-400';
    default: return 'bg-gray-600/20 text-gray-400';
  }
};

const getPlanBadge = (plan: string) => {
  switch(plan) {
    case 'starter': return 'bg-gray-600/20 text-gray-400';
    case 'growth': return 'bg-blue-600/20 text-blue-400';
    case 'pro': return 'bg-purple-600/20 text-purple-400';
    default: return 'bg-gray-600/20 text-gray-400';
  }
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Stores</h1>
        <p class="text-gray-400 mt-1">Manage your connected WooCommerce stores</p>
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
        <span class="text-xl">+</span>
        <span>Add Store</span>
      </button>
    </div>

    <!-- Stats Overview -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Total Stores</p>
        <p class="text-3xl font-bold text-white">{{ stores.length }}</p>
      </div>
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Active Stores</p>
        <p class="text-3xl font-bold text-white">{{ stores.filter(s => s.status === 'active').length }}</p>
      </div>
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Total Products</p>
        <p class="text-3xl font-bold text-white">{{ stores.reduce((sum, s) => sum + (s.stats.totalProducts || 0), 0) }}</p>
      </div>
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Total Revenue</p>
        <p class="text-3xl font-bold text-white">{{ stores.reduce((sum, s) => sum + (s.stats.totalRevenue || 0), 0) }} {{ stores[0]?.stats.currency || 'LEI' }}</p>
      </div>
    </div>

    <!-- Stores Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      <div 
        v-for="store in stores" 
        :key="store.storeId"
        class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition"
      >
        <!-- Store Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-white mb-1">{{ store.name }}</h3>
            <a :href="store.url" target="_blank" class="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
              {{ store.url }}
              <span class="text-xs">↗️</span>
            </a>
          </div>
        </div>

        <!-- Badges -->
        <div class="flex gap-2 mb-4">
          <span :class="['text-xs px-2 py-1 rounded-full', getStatusColor(store.status)]">
            {{ store.status.toUpperCase() }}
          </span>
          <span :class="['text-xs px-2 py-1 rounded-full', getPlanBadge(store.plan)]">
            {{ store.plan.toUpperCase() }}
          </span>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-800">
          <div>
            <p class="text-xs text-gray-400 mb-1">Products</p>
            <p class="text-lg font-semibold text-white">{{ store.stats.totalProducts || 0 }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-1">Revenue</p>
            <p :class="['text-lg font-semibold', store.stats.totalRevenue > 0 ? 'text-green-400' : 'text-gray-500']">{{ store.stats.totalRevenue }} {{ store.stats.currency || 'LEI' }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-1">Conversions</p>
            <p :class="['text-lg font-semibold', store.stats.conversions > 0 ? 'text-white' : 'text-gray-500']">{{ store.stats.conversions }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-1">Conv. Rate</p>
            <p class="text-lg font-semibold text-gray-500">{{ store.stats.conversionRate }}%</p>
          </div>
        </div>
        <p class="text-xs text-green-400 mb-4" v-if="store.stats.conversions > 0">{{ store.stats.conversions }} AI recommendations converted</p>
        <p class="text-xs text-gray-500 mb-4" v-else>No conversions yet</p>

        <!-- API Key -->
        <div class="mb-4">
          <p class="text-xs text-gray-400 mb-1">API Key</p>
          <div class="flex items-center gap-2">
            <code class="text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded flex-1 truncate">{{ store.apiKey }}</code>
            <button class="text-gray-400 hover:text-white transition">📋</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button class="flex-1 bg-blue-600/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-600/30 transition text-sm">
            View Details
          </button>
          <button class="bg-gray-800/50 text-gray-400 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">
            ⚙️
          </button>
          <button class="bg-red-600/20 text-red-400 px-3 py-2 rounded-lg hover:bg-red-600/30 transition text-sm">
            🗑️
          </button>
        </div>

        <!-- Created Date -->
        <p class="text-xs text-gray-500 mt-4">
          Created {{ store.createdAt.toLocaleDateString() }}
        </p>
      </div>
    </div>
  </div>
</template>
