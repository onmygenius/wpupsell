<script setup lang="ts">
import { ref } from 'vue';
import { Chart } from 'highcharts-vue';

// Mock data - will be replaced with real Firestore data
const analytics = ref({
  totalRevenue: 24567,
  upsellRevenue: 8945,
  conversions: 456,
  impressions: 1234,
  conversionRate: 32.5,
  avgOrderValue: 53.87
});

// Revenue Chart (Line)
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
    data: [3200, 4100, 3800, 5200, 4800, 6100, 5400],
    color: '#3b82f6'
  }, {
    name: 'Upsell Revenue',
    data: [1200, 1500, 1300, 1900, 1700, 2200, 1950],
    color: '#10b981'
  }]
});

// Conversion Funnel (Bar)
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
    data: [1234, 856, 612, 456],
    color: '#8b5cf6'
  }]
});

// Top Products (mock data - will come from Firestore topProducts array)
const topProducts = ref([
  { productId: 'prod_001', name: 'iPhone 15 Pro', conversions: 124, revenue: 123876, conversionRate: 42.5 },
  { productId: 'prod_002', name: 'Husă iPhone', conversions: 98, revenue: 4410, conversionRate: 87.2 },
  { productId: 'prod_003', name: 'AirPods Pro', conversions: 67, revenue: 16683, conversionRate: 38.1 },
  { productId: 'prod_004', name: 'MacBook Air M2', conversions: 45, revenue: 44955, conversionRate: 28.9 },
  { productId: 'prod_005', name: 'Apple Watch', conversions: 34, revenue: 13566, conversionRate: 31.2 }
]);
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
        <p class="text-3xl font-bold text-white">${{ analytics.totalRevenue.toLocaleString() }}</p>
        <p class="text-xs text-green-400 mt-2">+18% from last period</p>
      </div>

      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Upsell Revenue</p>
        <p class="text-3xl font-bold text-white">${{ analytics.upsellRevenue.toLocaleString() }}</p>
        <p class="text-xs text-green-400 mt-2">+25% from last period</p>
      </div>

      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Conversion Rate</p>
        <p class="text-3xl font-bold text-white">{{ analytics.conversionRate }}%</p>
        <p class="text-xs text-green-400 mt-2">+5.2% from last period</p>
      </div>

      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Avg Order Value</p>
        <p class="text-3xl font-bold text-white">${{ analytics.avgOrderValue }}</p>
        <p class="text-xs text-green-400 mt-2">+12% from last period</p>
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
              <td class="py-4 text-right text-white">{{ product.conversions }}</td>
              <td class="py-4 text-right text-white">${{ product.revenue.toLocaleString() }}</td>
              <td class="py-4 text-right">
                <span class="text-green-400">{{ product.conversionRate }}%</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
