<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

const API_URL = 'https://wpupsell-dashboard.vercel.app/api';
const STORE_ID = 'store_fHg74QwLurg5'; // TODO: Get from auth

const loading = ref(true);
const landingPages = ref<any[]>([]);
const showGenerateModal = ref(false);
const products = ref<any[]>([]);
const searchQuery = ref('');
const selectedProduct = ref<any>(null);
const pageTitle = ref('');
const pageSlug = ref('');
const urlPrefix = ref('oferte');
const generating = ref(false);

onMounted(async () => {
  await Promise.all([
    loadLandingPages(),
    loadProducts()
  ]);
});

async function loadLandingPages() {
  try {
    const response = await fetch(`${API_URL}/landing-pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'list',
        storeId: STORE_ID 
      }),
    });
    
    const data = await response.json();
    if (data.success) {
      landingPages.value = data.landingPages || [];
    }
  } catch (error) {
    console.error('Failed to load landing pages:', error);
  } finally {
    loading.value = false;
  }
}

async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'list',
        storeId: STORE_ID 
      }),
    });
    
    const data = await response.json();
    if (data.success) {
      products.value = data.products || [];
    }
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

function openGenerateModal() {
  showGenerateModal.value = true;
  searchQuery.value = '';
  selectedProduct.value = null;
  pageTitle.value = '';
  pageSlug.value = '';
  urlPrefix.value = 'oferte';
}

function closeGenerateModal() {
  showGenerateModal.value = false;
}

function selectProduct(product: any) {
  selectedProduct.value = product;
  pageTitle.value = `${product.name} - Ofertă Specială`;
  pageSlug.value = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-oferta';
}

function sanitizeSlug() {
  pageSlug.value = pageSlug.value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const filteredProducts = computed(() => {
  if (!searchQuery.value) return products.value.slice(0, 10);
  
  const query = searchQuery.value.toLowerCase();
  return products.value
    .filter(p => p.name.toLowerCase().includes(query))
    .slice(0, 10);
});

const previewUrl = computed(() => {
  const prefix = urlPrefix.value ? `${urlPrefix.value}/` : '';
  return `bijuteriaregala.ro/${prefix}${pageSlug.value}`;
});

async function generateLandingPage() {
  if (!selectedProduct.value || !pageTitle.value || !pageSlug.value) {
    alert('Please fill all required fields');
    return;
  }
  
  generating.value = true;
  
  try {
    const response = await fetch(`${API_URL}/generate-landing-page`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: selectedProduct.value.productId,
        pageTitle: pageTitle.value,
        pageSlug: pageSlug.value,
        urlPrefix: urlPrefix.value,
        storeId: STORE_ID,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Landing page generated successfully!');
      closeGenerateModal();
      await loadLandingPages();
    } else {
      alert('Failed to generate landing page: ' + data.error);
    }
  } catch (error) {
    console.error('Failed to generate landing page:', error);
    alert('Failed to generate landing page');
  } finally {
    generating.value = false;
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">🎨 Landing Pages</h1>
        <p class="text-gray-400 mt-1">Generate high-converting product pages with AI</p>
      </div>
      <button 
        @click="openGenerateModal"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span class="text-xl">+</span>
        Generate New Landing Page
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p class="text-gray-400 mt-4">Loading landing pages...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="landingPages.length === 0" class="text-center py-12 bg-[#0f1535] rounded-xl border border-gray-800">
      <div class="text-6xl mb-4">🎨</div>
      <h2 class="text-2xl font-bold text-white mb-2">No Landing Pages Yet</h2>
      <p class="text-gray-400 mb-6">Create your first AI-powered landing page to boost conversions!</p>
      <button 
        @click="openGenerateModal"
        class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-flex items-center gap-2"
      >
        <span class="text-xl">+</span>
        Generate Your First Landing Page
      </button>
    </div>

    <!-- Landing Pages List -->
    <div v-else class="grid grid-cols-1 gap-6">
      <div 
        v-for="page in landingPages" 
        :key="page.id"
        class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 hover:border-gray-700 transition"
      >
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-white mb-2">{{ page.title }}</h3>
            <p class="text-sm text-blue-400 mb-3">🔗 {{ page.url }}</p>
            
            <div class="flex items-center gap-4 text-sm">
              <span :class="['px-3 py-1 rounded-full text-xs font-medium', 
                page.status === 'published' ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400']">
                {{ page.status === 'published' ? '✅ Published' : '📝 Draft' }}
              </span>
              <span class="text-gray-400">👁️ {{ page.views || 0 }} views</span>
              <span class="text-gray-400">🛒 {{ page.addToCarts || 0 }} add to cart</span>
              <span class="text-gray-400">💰 {{ page.conversions || 0 }} conversions</span>
            </div>
          </div>
          
          <div class="flex items-center gap-2">
            <button class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Preview">
              👁️
            </button>
            <button class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Edit">
              ✏️
            </button>
            <button class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Stats">
              📊
            </button>
            <button class="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition" title="Delete">
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Generate Modal -->
    <div v-if="showGenerateModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeGenerateModal">
      <div class="bg-[#0a0f2e] rounded-xl border border-gray-800 p-8 max-w-2xl w-full mx-4">
        <h2 class="text-2xl font-bold text-white mb-6">🎨 Generate Landing Page</h2>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Search Product</label>
            <input 
              v-model="searchQuery"
              type="text" 
              placeholder="Search by product name..."
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            />
            
            <!-- Product Dropdown -->
            <div v-if="searchQuery && filteredProducts.length > 0" class="mt-2 bg-[#0f1535] border border-gray-800 rounded-lg max-h-60 overflow-y-auto">
              <button
                v-for="product in filteredProducts"
                :key="product.productId"
                @click="selectProduct(product)"
                class="w-full text-left px-4 py-3 hover:bg-gray-800 transition border-b border-gray-800 last:border-b-0"
              >
                <p class="text-white font-medium">{{ product.name }}</p>
                <p class="text-sm text-gray-400">{{ product.price }} LEI - {{ product.category }}</p>
              </button>
            </div>
            
            <!-- Selected Product -->
            <div v-if="selectedProduct" class="mt-2 bg-green-600/20 border border-green-600/50 rounded-lg px-4 py-3">
              <p class="text-green-400 font-medium">✅ Selected: {{ selectedProduct.name }}</p>
              <p class="text-sm text-gray-400">{{ selectedProduct.price }} LEI</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Page Title</label>
            <input 
              v-model="pageTitle"
              type="text" 
              placeholder="Lănțișor Perla Eleganței - Ofertă Specială"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">URL Slug</label>
            <input 
              v-model="pageSlug"
              @input="sanitizeSlug"
              type="text" 
              placeholder="lantisor-perla-elegantei-oferta"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            />
            <p class="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">URL Prefix (optional)</label>
            <select v-model="urlPrefix" class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none">
              <option value="">No prefix</option>
              <option value="oferte">oferte</option>
              <option value="promo">promo</option>
              <option value="lp">lp</option>
              <option value="landing">landing</option>
            </select>
          </div>
          
          <div class="bg-[#0f1535] border border-gray-800 rounded-lg p-4">
            <label class="block text-sm font-medium text-gray-400 mb-1">Preview URL:</label>
            <p class="text-blue-400">🔗 {{ previewUrl }}</p>
          </div>
        </div>
        
        <div class="flex items-center gap-4 mt-8">
          <button 
            @click="closeGenerateModal"
            class="flex-1 bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button 
            @click="generateLandingPage"
            :disabled="generating"
            class="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ generating ? '⏳ Generating...' : '🎨 Generate Landing Page' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
