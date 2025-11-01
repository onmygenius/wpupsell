<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

// Mock data - will be replaced with real API call
const products = ref([
  {
    id: '1',
    productId: '123',
    storeId: 'store_001',
    name: 'Lănțișor "Perla Eleganței" – Rafinament în cea mai pură formă',
    category: 'Lanturi',
    price: 2850,
    stock: 15,
    image: 'https://bijuteriaregala.ro/wp-content/uploads/2024/01/lantisor.jpg',
    url: 'https://bijuteriaregala.ro/product/lantisor-perla',
    enabled: true,
    syncedAt: new Date('2025-11-01T06:00:00'),
  },
  {
    id: '2',
    productId: '124',
    storeId: 'store_001',
    name: 'Brățara "Panther Luxe" – Puterea eleganței într-o brățară de aur',
    category: 'Bratari',
    price: 5500,
    stock: 8,
    image: 'https://bijuteriaregala.ro/wp-content/uploads/2024/01/bratara.jpg',
    url: 'https://bijuteriaregala.ro/product/bratara-panther',
    enabled: true,
    syncedAt: new Date('2025-11-01T06:00:00'),
  },
  {
    id: '3',
    productId: '125',
    storeId: 'store_001',
    name: 'Cercei "Golden Whisper" – Eleganță care prinde viață',
    category: 'Cercei',
    price: 2200,
    stock: 3,
    image: 'https://bijuteriaregala.ro/wp-content/uploads/2024/01/cercei.jpg',
    url: 'https://bijuteriaregala.ro/product/cercei-golden',
    enabled: false,
    syncedAt: new Date('2025-11-01T06:00:00'),
  },
]);

const loading = ref(false);
const syncing = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('all');
const lastSync = ref(new Date('2025-11-01T06:00:00'));

// Get unique categories
const categories = computed(() => {
  const cats = new Set(products.value.map(p => p.category));
  return ['all', ...Array.from(cats)];
});

// Filter products
const filteredProducts = computed(() => {
  return products.value.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesCategory = selectedCategory.value === 'all' || product.category === selectedCategory.value;
    return matchesSearch && matchesCategory;
  });
});

// Stats
const stats = computed(() => ({
  total: products.value.length,
  enabled: products.value.filter(p => p.enabled).length,
  disabled: products.value.filter(p => !p.enabled).length,
  lowStock: products.value.filter(p => p.stock < 5).length,
}));

// Toggle product enabled/disabled
const toggleProduct = async (product: any) => {
  product.enabled = !product.enabled;
  // TODO: Call API to update
  console.log('Toggle product:', product.id, product.enabled);
};

// Sync products
const syncProducts = async () => {
  syncing.value = true;
  try {
    // TODO: Call API to sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    lastSync.value = new Date();
    console.log('Products synced!');
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    syncing.value = false;
  }
};

// Load products on mount
onMounted(async () => {
  loading.value = true;
  try {
    // TODO: Load products from API
    await new Promise(resolve => setTimeout(resolve, 1000));
  } catch (error) {
    console.error('Load error:', error);
  } finally {
    loading.value = false;
  }
});

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('ro-RO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">Products</h1>
        <p class="text-gray-400 mt-1">Manage product recommendations and sync</p>
      </div>
      <button 
        @click="syncProducts"
        :disabled="syncing"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="syncing" class="animate-spin">🔄</span>
        <span v-else>🔄</span>
        <span>{{ syncing ? 'Syncing...' : 'Sync Products' }}</span>
      </button>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Total Products</p>
        <p class="text-3xl font-bold text-white">{{ stats.total }}</p>
      </div>
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Enabled</p>
        <p class="text-3xl font-bold text-green-400">{{ stats.enabled }}</p>
      </div>
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Disabled</p>
        <p class="text-3xl font-bold text-red-400">{{ stats.disabled }}</p>
      </div>
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
        <p class="text-sm text-gray-400 mb-1">Low Stock</p>
        <p class="text-3xl font-bold text-orange-400">{{ stats.lowStock }}</p>
      </div>
    </div>

    <!-- Last Sync Info -->
    <div class="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl">ℹ️</span>
        <div>
          <p class="text-sm font-medium text-blue-400">Last Sync</p>
          <p class="text-xs text-gray-400">{{ formatDate(lastSync) }}</p>
        </div>
      </div>
      <p class="text-sm text-gray-400">Products are synced automatically daily</p>
    </div>

    <!-- Filters -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
      <div class="flex flex-col md:flex-row gap-4">
        <!-- Search -->
        <div class="flex-1">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search products..."
            class="w-full bg-gray-800/50 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-600"
          />
        </div>
        
        <!-- Category Filter -->
        <select
          v-model="selectedCategory"
          class="bg-gray-800/50 border border-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-600"
        >
          <option v-for="cat in categories" :key="cat" :value="cat">
            {{ cat === 'all' ? 'All Categories' : cat }}
          </option>
        </select>
      </div>
    </div>

    <!-- Products Table -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-800/50">
            <tr>
              <th class="text-left text-sm font-medium text-gray-400 px-6 py-4">Product</th>
              <th class="text-left text-sm font-medium text-gray-400 px-6 py-4">Category</th>
              <th class="text-right text-sm font-medium text-gray-400 px-6 py-4">Price</th>
              <th class="text-right text-sm font-medium text-gray-400 px-6 py-4">Stock</th>
              <th class="text-center text-sm font-medium text-gray-400 px-6 py-4">Recommendations</th>
              <th class="text-center text-sm font-medium text-gray-400 px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-if="loading"
              class="border-t border-gray-800"
            >
              <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                <div class="flex items-center justify-center gap-3">
                  <span class="animate-spin">🔄</span>
                  <span>Loading products...</span>
                </div>
              </td>
            </tr>
            
            <tr 
              v-else-if="filteredProducts.length === 0"
              class="border-t border-gray-800"
            >
              <td colspan="6" class="px-6 py-8 text-center text-gray-400">
                No products found
              </td>
            </tr>
            
            <tr 
              v-else
              v-for="product in filteredProducts" 
              :key="product.id"
              class="border-t border-gray-800 hover:bg-gray-800/30 transition"
            >
              <!-- Product -->
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img 
                    v-if="product.image" 
                    :src="product.image" 
                    :alt="product.name"
                    class="w-12 h-12 rounded-lg object-cover"
                  />
                  <div class="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center" v-else>
                    📦
                  </div>
                  <div class="max-w-xs">
                    <a 
                      :href="product.url" 
                      target="_blank"
                      class="text-sm font-medium text-white hover:text-blue-400 transition line-clamp-2"
                    >
                      {{ product.name }}
                    </a>
                  </div>
                </div>
              </td>
              
              <!-- Category -->
              <td class="px-6 py-4">
                <span class="text-sm text-gray-400">{{ product.category }}</span>
              </td>
              
              <!-- Price -->
              <td class="px-6 py-4 text-right">
                <span class="text-sm font-semibold text-white">${{ product.price }}</span>
              </td>
              
              <!-- Stock -->
              <td class="px-6 py-4 text-right">
                <span 
                  :class="[
                    'text-sm font-semibold',
                    product.stock < 5 ? 'text-red-400' : 'text-green-400'
                  ]"
                >
                  {{ product.stock }}
                </span>
              </td>
              
              <!-- Recommendations Toggle -->
              <td class="px-6 py-4 text-center">
                <button
                  @click="toggleProduct(product)"
                  :class="[
                    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                    product.enabled ? 'bg-blue-600' : 'bg-gray-700'
                  ]"
                >
                  <span
                    :class="[
                      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                      product.enabled ? 'translate-x-6' : 'translate-x-1'
                    ]"
                  />
                </button>
              </td>
              
              <!-- Actions -->
              <td class="px-6 py-4 text-center">
                <div class="flex items-center justify-center gap-2">
                  <a
                    :href="product.url"
                    target="_blank"
                    class="text-gray-400 hover:text-blue-400 transition"
                    title="View Product"
                  >
                    👁️
                  </a>
                  <button
                    class="text-gray-400 hover:text-green-400 transition"
                    title="View Stats"
                  >
                    📊
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
