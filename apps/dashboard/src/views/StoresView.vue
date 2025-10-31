<script setup lang="ts">
import { ref } from 'vue';

// Mock stores data - will be replaced with real Firestore data
const stores = ref([
  {
    storeId: 'store_001',
    name: 'Alex Electronics',
    url: 'https://alex-electronics.com',
    apiKey: 'sk_live_abc123...',
    plan: 'growth',
    status: 'active',
    userId: 'user_123',
    createdAt: new Date('2025-09-15'),
    stats: {
      totalRevenue: 45678,
      upsellRevenue: 12340,
      conversions: 234,
      conversionRate: 28.5
    }
  },
  {
    storeId: 'store_002',
    name: 'Fashion Boutique',
    url: 'https://fashion-boutique.com',
    apiKey: 'sk_live_def456...',
    plan: 'starter',
    status: 'trial',
    userId: 'user_123',
    createdAt: new Date('2025-10-20'),
    stats: {
      totalRevenue: 12450,
      upsellRevenue: 3200,
      conversions: 89,
      conversionRate: 22.1
    }
  },
  {
    storeId: 'store_003',
    name: 'Home Decor Shop',
    url: 'https://homedecor.com',
    apiKey: 'sk_live_ghi789...',
    plan: 'pro',
    status: 'active',
    userId: 'user_123',
    createdAt: new Date('2025-08-10'),
    stats: {
      totalRevenue: 67890,
      upsellRevenue: 18900,
      conversions: 456,
      conversionRate: 35.2
    }
  }
]);

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
        <p class="text-sm text-gray-400 mb-1">Total Revenue</p>
        <p class="text-3xl font-bold text-white">${{ stores.reduce((sum, s) => sum + s.stats.totalRevenue, 0).toLocaleString() }}</p>
      </div>
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Avg Conv. Rate</p>
        <p class="text-3xl font-bold text-white">{{ (stores.reduce((sum, s) => sum + s.stats.conversionRate, 0) / stores.length).toFixed(1) }}%</p>
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
            <p class="text-xs text-gray-400 mb-1">Revenue</p>
            <p class="text-lg font-semibold text-white">${{ store.stats.totalRevenue.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-1">Upsell</p>
            <p class="text-lg font-semibold text-green-400">${{ store.stats.upsellRevenue.toLocaleString() }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-1">Conversions</p>
            <p class="text-lg font-semibold text-white">{{ store.stats.conversions }}</p>
          </div>
          <div>
            <p class="text-xs text-gray-400 mb-1">Conv. Rate</p>
            <p class="text-lg font-semibold text-white">{{ store.stats.conversionRate }}%</p>
          </div>
        </div>

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
