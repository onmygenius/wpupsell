<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import PieDonutChart from '../components/charts/PieDonutChart.vue';
import { useAuthStore } from '../stores/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const authStore = useAuthStore();
const API_URL = import.meta.env.VITE_API_URL || 'https://wpupsell-dashboard.vercel.app/api';
const STORE_ID = authStore.userId; // Use userId as storeId - 100% dynamic!

const loading = ref(true);
const hasStore = ref(false);
const stats = ref({
  totalSales: 0,
  enabledProducts: 0,
  orders: 0,
  products: 0
});

const currency = ref('LEI'); // Default currency

const categoryData = ref<any[]>([]);
const topProducts = ref<any[]>([]);
const recentActivity = ref<any[]>([]);
const conversionRate = ref(0);

// Usage tracking
const planData = ref({
  plan: 'free',
  limits: {
    pagesPerMonth: 5,
    maxProducts: 10
  },
  usage: {
    pagesGenerated: 0,
    currentPeriodEnd: new Date()
  }
});

// Computed properties for usage
const usagePercent = computed(() => {
  const { pagesGenerated } = planData.value.usage;
  const { pagesPerMonth } = planData.value.limits;
  return Math.round((pagesGenerated / pagesPerMonth) * 100);
});

const showWarning = computed(() => usagePercent.value >= 80);

const resetDate = computed(() => {
  const date = planData.value.usage.currentPeriodEnd;
  if (!date) return 'N/A';
  
  try {
    let d: Date;
    // Handle Firebase Timestamp
    if ((date as any).toDate && typeof (date as any).toDate === 'function') {
      d = (date as any).toDate();
    } else if ((date as any)._seconds) {
      d = new Date((date as any)._seconds * 1000);
    } else {
      d = new Date(date);
    }
    
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  } catch (error) {
    return 'N/A';
  }
});

const planName = computed(() => planData.value.plan.toUpperCase());

// Format time ago
const formatTime = (timestamp: any) => {
  if (!timestamp) return 'Just now';
  
  try {
    // Handle Firebase Timestamp
    let date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp._seconds) {
      date = new Date(timestamp._seconds * 1000);
    } else if (timestamp instanceof Date) {
      date = timestamp;
    } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
      date = new Date(timestamp);
    } else {
      return 'Just now';
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Just now';
    }
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // seconds
    
    if (diff < 0) return 'Just now'; // Future date
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return `${Math.floor(diff / 86400)} days ago`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Just now';
  }
};

onMounted(async () => {
  try {
    // Check if user has a store connected
    if (!STORE_ID) {
      loading.value = false;
      hasStore.value = false;
      return; // No store connected, show empty dashboard
    }
    
    hasStore.value = true;
    
    // Load products count
    const productsResponse = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', storeId: STORE_ID }),
    });
    
    const productsData = await productsResponse.json();
    if (productsData.success) {
      stats.value.products = productsData.products.length;
      
      // Calculate stats from products
      const enabledProducts = productsData.products.filter((p: any) => p.enabled);
      stats.value.enabledProducts = enabledProducts.length;
      
      // Calculate category distribution
      const categories = productsData.products.reduce((acc: any, p: any) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {});
      
      categoryData.value = Object.entries(categories).map(([name, count]) => ({
        name,
        count,
        percentage: ((count as number / productsData.products.length) * 100).toFixed(1)
      }));
      
      // Top products will be populated from stats API
    }
    
    // Load conversions stats
    const statsResponse = await fetch(`${API_URL}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: STORE_ID }),
    });
    
    const statsData = await statsResponse.json();
    if (statsData.success) {
      stats.value.totalSales = statsData.stats.totalRevenue;
      stats.value.orders = statsData.stats.orders;
      
      // Get currency from store (default to LEI for Romanian stores)
      currency.value = statsData.stats.currency || 'LEI';
      
      // Get recent conversions for activity feed
      if (statsData.stats.recentConversions) {
        recentActivity.value = statsData.stats.recentConversions.slice(0, 5).map((conv: any) => ({
          type: 'conversion',
          title: 'New AI sale',
          description: conv.productName,
          time: conv.createdAt,
          icon: '✅'
        }));
      }
      
      // Get top products by conversions
      if (statsData.stats.topProducts) {
        topProducts.value = statsData.stats.topProducts;
      }
      
      // Calculate conversion rate from funnel
      if (statsData.stats.funnel && statsData.stats.funnel.impressions > 0) {
        conversionRate.value = Math.round((statsData.stats.funnel.conversions / statsData.stats.funnel.impressions) * 100 * 10) / 10;
      }
    }
    
    // Load plan data from Firebase
    try {
      const storeDoc = await getDoc(doc(db, 'stores', STORE_ID));
      if (storeDoc.exists()) {
        const storeData = storeDoc.data();
        if (storeData.plan && storeData.limits && storeData.usage) {
          planData.value = {
            plan: storeData.plan,
            limits: storeData.limits,
            usage: storeData.usage
          };
        }
      }
    } catch (error) {
      console.error('Failed to load plan data:', error);
    }
  } catch (error) {
    console.error('Failed to load stats:', error);
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
        <p class="text-2xl font-bold text-white">{{ stats.totalSales.toLocaleString() }} {{ currency }}</p>
        <p class="text-xs text-green-400 mt-2" v-if="stats.orders > 0">{{ stats.orders }} upsell {{ stats.orders === 1 ? 'order' : 'orders' }}</p>
        <p class="text-xs text-gray-500 mt-2" v-else>No conversions yet</p>
      </div>

      <!-- Active Users -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition">
        <div class="flex items-center justify-between mb-4">
          <div class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center">
            <span class="text-xl">👥</span>
          </div>
          <span class="text-xs font-medium text-red-400">-5%</span>
        </div>
        <p class="text-sm text-gray-400 mb-1">Enabled Products</p>
        <p class="text-2xl font-bold text-white">{{ stats.enabledProducts }}</p>
        <p class="text-xs text-gray-400 mt-2">Products with recommendations</p>
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
        <p class="text-2xl font-bold text-white">{{ stats.orders }}</p>
        <p class="text-xs text-green-400 mt-2" v-if="stats.orders > 0">From AI recommendations</p>
        <p class="text-xs text-gray-500 mt-2" v-else>No orders yet</p>
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
        <p class="text-2xl font-bold text-white">{{ stats.products }}</p>
        <p class="text-xs text-gray-400 mt-2">Total synced products</p>
      </div>
    </div>

    <!-- Usage Card -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-white">Monthly Usage</h2>
          <p class="text-sm text-gray-400 mt-1">{{ planName }} Plan</p>
        </div>
        <div class="px-3 py-1 bg-blue-600/20 rounded-lg">
          <span class="text-sm font-medium text-blue-400">{{ planName }}</span>
        </div>
      </div>

      <!-- Pages Generated -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-400">Pages Generated</span>
          <span class="text-sm font-semibold text-white">
            {{ planData.usage.pagesGenerated }} / {{ planData.limits.pagesPerMonth }}
          </span>
        </div>
        
        <!-- Progress Bar -->
        <div class="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
          <div 
            class="h-3 rounded-full transition-all duration-500"
            :class="showWarning ? 'bg-yellow-500' : 'bg-blue-600'"
            :style="{ width: usagePercent + '%' }"
          ></div>
        </div>
        
        <div class="flex items-center justify-between mt-2">
          <span class="text-xs text-gray-500">{{ usagePercent }}% used</span>
          <span class="text-xs text-gray-500">Resets on {{ resetDate }}</span>
        </div>
      </div>

      <!-- Warning Message -->
      <div 
        v-if="showWarning" 
        class="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4"
      >
        <div class="flex items-start gap-3">
          <span class="text-xl">⚠️</span>
          <div class="flex-1">
            <p class="text-sm font-medium text-yellow-400 mb-1">
              You're running low on pages!
            </p>
            <p class="text-xs text-yellow-400/80">
              You've used {{ planData.usage.pagesGenerated }} of {{ planData.limits.pagesPerMonth }} pages this month.
            </p>
          </div>
        </div>
      </div>

      <!-- Upgrade Button -->
      <button 
        disabled
        class="w-full bg-gray-700 text-gray-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed opacity-50"
      >
        Upgrade Plan (Coming Soon)
      </button>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <PieDonutChart :data="categoryData" />
      
      <!-- Performance Metrics - Coming Soon -->
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 flex items-center justify-center">
        <div class="text-center">
          <p class="text-xl font-semibold text-white mb-2">Performance Metrics</p>
          <p class="text-sm text-gray-400">Coming soon - Track conversions to see metrics</p>
        </div>
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
        
        <div class="space-y-4" v-if="recentActivity.length > 0">
          <div v-for="(activity, index) in recentActivity" :key="index" class="flex items-start gap-4">
            <div class="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span class="text-lg">{{ activity.icon }}</span>
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-white">{{ activity.title }}</p>
              <p class="text-xs text-gray-400">{{ activity.description }}</p>
            </div>
            <span class="text-xs text-gray-500">{{ formatTime(activity.time) }}</span>
          </div>
        </div>
        
        <div v-else class="text-center py-8 text-gray-500">
          <p>No recent activity</p>
          <p class="text-xs mt-2">AI conversions will appear here</p>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="space-y-6">
        <!-- Performance -->
        <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Quick Stats</h2>
          <div class="space-y-4">
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">AI Conversion Rate</span>
                <span class="text-sm font-semibold text-white">{{ conversionRate }}%</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" :style="`width: ${Math.min(conversionRate * 10, 100)}%`"></div>
              </div>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Total Orders</span>
                <span class="text-sm font-semibold text-white">{{ stats.orders }}</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" :style="`width: ${Math.min(stats.orders * 5, 100)}%`"></div>
              </div>
            </div>
            
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm text-gray-400">Enabled Products</span>
                <span class="text-sm font-semibold text-white">{{ stats.enabledProducts }}</span>
              </div>
              <div class="w-full bg-gray-800 rounded-full h-2">
                <div class="bg-purple-600 h-2 rounded-full" :style="`width: ${Math.min((stats.enabledProducts / stats.products) * 100, 100)}%`"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Recommended Products by AI -->
        <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
          <h2 class="text-xl font-semibold text-white mb-6">Top Recommended Products by AI</h2>
          <div class="space-y-3">
            <div v-if="topProducts.length === 0" class="text-center text-gray-500 py-4">
              No conversions yet
            </div>
            <div 
              v-for="product in topProducts" 
              :key="product.name"
              class="flex items-center justify-between"
            >
              <span class="text-sm text-gray-400 truncate mr-2">{{ product.name }}</span>
              <span class="text-sm font-semibold text-green-400">{{ product.conversions }} sales</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
