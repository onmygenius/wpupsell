<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

// Auth
const authStore = useAuthStore();
const STORE_ID = authStore.userId; // Use userId as storeId

// Product interface
interface Product {
  id: string;
  productId: string;
  storeId: string;
  name: string;
  category: string;
  price: number;
  currency?: string;
  stock: number;
  image?: string;
  url: string;
  enabled: boolean;
  syncedAt: Date;
}

// Real data from API
const products = ref<Product[]>([]);
const store = ref<any>(null);
const router = useRouter();

const loading = ref(false);
const syncing = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('all');
const lastSync = ref(new Date('2025-11-01T06:00:00'));

// Pagination
const currentPage = ref(1);
const itemsPerPage = 50;

// Promote modal
const showPromoteModal = ref(false);
const promotingProduct = ref<Product | null>(null);

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

// Paginated products
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredProducts.value.slice(start, end);
});

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage);
});

// Currency symbol (for store default)
const currencySymbol = computed(() => {
  const currency = store.value?.currency || 'USD';
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'LEI': 'LEI',
    'RON': 'LEI'
  };
  return symbols[currency] || currency;
});

// Get currency symbol for a specific product
const getProductCurrency = (product: Product) => {
  const currency = product.currency || store.value?.currency || 'USD';
  const symbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'LEI': 'LEI',
    'RON': 'LEI'
  };
  return symbols[currency] || currency;
};

// Locale for date formatting
const locale = computed(() => {
  const currency = store.value?.currency || 'USD';
  const locales: Record<string, string> = {
    'USD': 'en-US',
    'EUR': 'en-GB',
    'GBP': 'en-GB',
    'LEI': 'ro-RO',
    'RON': 'ro-RO'
  };
  return locales[currency] || 'en-US';
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
  const previousState = product.enabled;
  product.enabled = !product.enabled;
  
  try {
    // TODO: Update product in Firestore
    console.log('Toggle product:', product.id, product.enabled);
    alert('Product toggle - coming soon!');
    product.enabled = previousState; // Revert for now
  } catch (error) {
    product.enabled = previousState;
    console.error('Toggle error:', error);
    alert('Failed to update product');
  }
};

// Sync products
const syncProducts = async () => {
  syncing.value = true;
  try {
    // Note: Sync is triggered from plugin, this just reloads
    await loadProducts();
    lastSync.value = new Date();
    alert('Products refreshed! Note: Sync happens automatically from your WooCommerce store.');
  } catch (error) {
    console.error('Sync error:', error);
    alert('Failed to refresh products');
  } finally {
    syncing.value = false;
  }
};

// Load store data
const loadStore = async () => {
  if (!STORE_ID) return;
  
  try {
    const storeDoc = await getDoc(doc(db, 'stores', STORE_ID));
    if (storeDoc.exists()) {
      store.value = storeDoc.data();
    }
  } catch (error) {
    console.error('Failed to load store:', error);
  }
};

// Load products from Firestore
const loadProducts = async () => {
  if (!STORE_ID) {
    console.log('❌ No storeId - cannot load products');
    return;
  }

  loading.value = true;
  try {
    console.log('🔍 Loading products for store:', STORE_ID);
    
    const productsSnapshot = await getDocs(
      collection(db, 'stores', STORE_ID, 'products')
    );
    
    console.log('📦 Found products:', productsSnapshot.docs.length);
    
    products.value = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        productId: doc.id,
        storeId: STORE_ID,
        name: data.name || '',
        category: data.category || '',
        price: data.price || 0,
        stock: data.stock || 0,
        image: data.image,
        url: data.url || '',
        enabled: data.enabled !== false,
        syncedAt: data.syncedAt?._seconds ? new Date(data.syncedAt._seconds * 1000) : new Date(),
      };
    });
    
    // Update last sync time from first product
    if (products.value.length > 0) {
      lastSync.value = products.value[0]?.syncedAt || new Date();
    }
    
    console.log('✅ Products loaded:', products.value.length);
  } catch (error) {
    console.error('❌ Load error:', error);
  } finally {
    loading.value = false;
  }
};

// Open promote modal
const openPromoteModal = (product: Product) => {
  promotingProduct.value = product;
  showPromoteModal.value = true;
};

// Close promote modal
const closePromoteModal = () => {
  showPromoteModal.value = false;
  promotingProduct.value = null;
};

// Generate landing page
const generateLandingPage = () => {
  if (!promotingProduct.value) return;
  
  // Navigate to Landing Pages with product pre-selected
  router.push({
    path: '/landing-pages',
    query: { productId: promotingProduct.value.id }
  });
  
  closePromoteModal();
};

// Change page
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return;
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// Load products on mount
onMounted(async () => {
  await loadStore();
  await loadProducts();
});

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat(locale.value, {
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
              v-for="product in paginatedProducts" 
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
                <span class="text-sm font-semibold text-white">{{ product.price }} {{ getProductCurrency(product) }}</span>
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
                  <button
                    @click="openPromoteModal(product)"
                    class="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition text-xs font-medium"
                    title="Generate Landing Page"
                  >
                    🚀 Promote
                  </button>
                  <a
                    :href="product.url"
                    target="_blank"
                    class="text-gray-400 hover:text-blue-400 transition"
                    title="View Product"
                  >
                    👁️
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="px-6 py-4 border-t border-gray-800 flex items-center justify-between">
        <div class="text-sm text-gray-400">
          Showing {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }} of {{ filteredProducts.length }} products
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <div class="flex items-center gap-1">
            <button
              v-for="page in totalPages"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded-lg transition',
                page === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              ]"
            >
              {{ page }}
            </button>
          </div>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- Promote Modal -->
    <div
      v-if="showPromoteModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closePromoteModal"
    >
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 max-w-md w-full">
        <h2 class="text-2xl font-bold text-white mb-4">🚀 Promote Product</h2>
        
        <div v-if="promotingProduct" class="mb-6">
          <div class="flex items-center gap-3 mb-4">
            <img 
              v-if="promotingProduct.image" 
              :src="promotingProduct.image" 
              :alt="promotingProduct.name"
              class="w-16 h-16 rounded-lg object-cover"
            />
            <div class="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center" v-else>
              📦
            </div>
            <div class="flex-1">
              <p class="text-white font-medium">{{ promotingProduct.name }}</p>
              <p class="text-sm text-gray-400">{{ promotingProduct.price }} {{ getProductCurrency(promotingProduct) }}</p>
            </div>
          </div>
          
          <p class="text-gray-400 text-sm mb-4">
            Generate a high-converting landing page for this product with AI-powered content.
          </p>
        </div>
        
        <div class="flex gap-3">
          <button
            @click="closePromoteModal"
            class="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            @click="generateLandingPage"
            class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            🎨 Generate Page
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
