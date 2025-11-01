<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Chart } from 'highcharts-vue';

const API_URL = import.meta.env.VITE_API_URL || 'https://wpupsell-dashboard.vercel.app/api';
const STORE_ID = 'store_fHg74QwLurg5';

const loading = ref(true);
const analytics = ref({
  totalRevenue: 0,
  upsellRevenue: 0,
  conversions: 0,
  impressions: 0,
  conversionRate: 0,
  avgOrderValue: 0
});

const currency = ref('LEI');
const topProducts = ref<any[]>([]);

onMounted(async () => {
  try {
    // Load stats from conversions
    const statsResponse = await fetch(`${API_URL}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: STORE_ID }),
    });
    
    const statsData = await statsResponse.json();
    if (statsData.success) {
      analytics.value.totalRevenue = statsData.stats.totalRevenue;
      analytics.value.upsellRevenue = statsData.stats.totalRevenue; // All revenue is upsell
      analytics.value.conversions = statsData.stats.conversions;
      
      // Calculate avg order value
      if (statsData.stats.orders > 0) {
        analytics.value.avgOrderValue = Math.round((statsData.stats.totalRevenue / statsData.stats.orders) * 100) / 100;
      }
      
      currency.value = statsData.stats.currency || 'LEI';
    }
    
    // Load products
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', storeId: STORE_ID }),
    });
    
    const data = await response.json();
    if (data.success) {
      // Top products by price (since we don't have conversion data yet)
      topProducts.value = data.products
        .sort((a: any, b: any) => b.price - a.price)
        .slice(0, 5)
        .map((p: any) => ({
          productId: p.productId,
          name: p.name,
          conversions: 0,
          revenue: 0,
          conversionRate: 0
        }));
    }
  } catch (error) {
    console.error('Failed to load analytics:', error);
  } finally {
    loading.value = false;
  }
});

// Revenue Chart (Line) - No data yet
const revenueChartOptions = ref<any>({
  chart: {
    type: 'line',
    backgroundColor: 'transparent',
    height: 350
  },
  title: {
    text: 'Revenue Over Time',
    style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
  },
  subtitle: {
    text: 'Track conversions to see revenue data',
    style: { color: '#9ca3af', fontSize: '12px' }
  },
  xAxis: {
    categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    labels: { style: { color: '#9ca3af' } }
  },
  yAxis: {
    title: { text: 'Revenue ($)', style: { color: '#9ca3af' } },
    labels: { style: { color: '#9ca3af' } },
    gridLineColor: '#374151'
  },
  legend: { itemStyle: { color: '#9ca3af' } },
  series: [{
    name: 'Total Revenue',
    data: [0, 0, 0, 0, 0, 0, 0],
    color: '#3b82f6'
  }, {
    name: 'Upsell Revenue',
    data: [0, 0, 0, 0, 0, 0, 0],
    color: '#10b981'
  }]
});

// Conversion Funnel (Bar) - No data yet
const conversionChartOptions = ref<any>({
  chart: {
    type: 'bar',
    backgroundColor: 'transparent',
    height: 300
  },
  title: {
    text: 'Conversion Funnel',
    style: { color: '#ffffff', fontSize: '18px', fontWeight: 'bold' }
  },
  subtitle: {
    text: 'Track conversions to see funnel data',
    style: { color: '#9ca3af', fontSize: '12px' }
  },
  xAxis: {
    categories: ['Impressions', 'Clicks', 'Add to Cart', 'Conversions'],
    labels: { style: { color: '#9ca3af' } }
  },
  yAxis: {
    title: { text: 'Count', style: { color: '#9ca3af' } },
    labels: { style: { color: '#9ca3af' } },
    gridLineColor: '#374151'
  },
  legend: { enabled: false },
  series: [{
    name: 'Funnel',
    data: [0, 0, 0, 0],
    color: '#8b5cf6'
  }]
});

</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Analytics</h1>
        <p class="text-gray-400 mt-1">Detailed insights and performance metrics</p>
      </div>
      <div class="flex gap-3">
        <select class="bg-[#0f1535] border border-gray-800 text-white px-4 py-2 rounded-lg">
          <option>Last 7 days</option>
          <option>Last 30 days</option>
          <option>Last 90 days</option>
          <option>This year</option>
        </select>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          📥 Export Data
        </button>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Total Revenue</p>
        <p class="text-3xl font-bold text-white">{{ analytics.totalRevenue.toLocaleString() }} {{ currency }}</p>
        <p class="text-xs text-green-400 mt-2" v-if="analytics.conversions > 0">{{ analytics.conversions }} conversions</p>
        <p class="text-xs text-gray-500 mt-2" v-else>No conversions tracked yet</p>
      </div>

      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Upsell Revenue</p>
        <p class="text-3xl font-bold text-white">{{ analytics.upsellRevenue.toLocaleString() }} {{ currency }}</p>
        <p class="text-xs text-green-400 mt-2" v-if="analytics.conversions > 0">100% from AI recommendations</p>
        <p class="text-xs text-gray-500 mt-2" v-else>No conversions tracked yet</p>
      </div>

      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Conversion Rate</p>
        <p class="text-3xl font-bold text-white">{{ analytics.conversionRate }}%</p>
        <p class="text-xs text-gray-400 mt-2">Track impressions to calculate</p>
      </div>

      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Avg Order Value</p>
        <p class="text-3xl font-bold text-white">{{ analytics.avgOrderValue }} {{ currency }}</p>
        <p class="text-xs text-green-400 mt-2" v-if="analytics.avgOrderValue > 0">Per upsell order</p>
        <p class="text-xs text-gray-500 mt-2" v-else>No conversions tracked yet</p>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Revenue Chart -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <Chart :options="revenueChartOptions" />
      </div>

      <!-- Conversion Funnel -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <Chart :options="conversionChartOptions" />
      </div>
    </div>

    <!-- Top Products Table -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
      <h2 class="text-xl font-semibold text-white mb-6">Top Performing Products</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-gray-800">
              <th class="text-left text-sm font-medium text-gray-400 pb-3">Product</th>
              <th class="text-right text-sm font-medium text-gray-400 pb-3">Conversions</th>
              <th class="text-right text-sm font-medium text-gray-400 pb-3">Revenue</th>
              <th class="text-right text-sm font-medium text-gray-400 pb-3">Conv. Rate</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="product in topProducts" 
              :key="product.productId"
              class="border-b border-gray-800 hover:bg-gray-800/30 transition"
            >
              <td class="py-4 text-white">{{ product.name }}</td>
              <td class="py-4 text-right text-gray-500">{{ product.conversions }}</td>
              <td class="py-4 text-right text-gray-500">${{ product.revenue }}</td>
              <td class="py-4 text-right">
                <span class="text-gray-500">{{ product.conversionRate }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
