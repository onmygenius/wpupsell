<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from '../stores/auth';

const API_URL = import.meta.env.VITE_API_URL || 'https://wpupsell-dashboard.vercel.app/api';
const authStore = useAuthStore();

const stores = ref<any[]>([]);
const loading = ref(true);
const editingStore = ref(false);
const creatingStore = ref(false);
const editForm = ref({
  name: '',
  url: '',
  apiKey: ''
});

onMounted(async () => {
  await loadStore();
});

async function loadStore() {
  try {
    loading.value = true;
    const storeId = localStorage.getItem('storeId');
    
    if (!storeId) {
      // No store yet - user needs to create one
      loading.value = false;
      return;
    }
    
    // Load store from Firebase
    const storeDoc = await getDoc(doc(db, 'stores', storeId));
    
    if (!storeDoc.exists()) {
      // Store doesn't exist - clear localStorage
      localStorage.removeItem('storeId');
      loading.value = false;
      return;
    }
    
    const storeData = storeDoc.data();
    
    // Load products to get count
    const productsResponse = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list', storeId }),
    });
    
    const productsData = await productsResponse.json();
    
    // Load stats from conversions
    const statsResponse = await fetch(`${API_URL}/stats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId }),
    });
    
    const statsData = await statsResponse.json();
    
    // Merge store data with stats
    stores.value = [{
      ...storeData,
      stats: {
        totalRevenue: statsData.success ? statsData.stats.totalRevenue : 0,
        upsellRevenue: statsData.success ? statsData.stats.totalRevenue : 0,
        conversions: statsData.success ? statsData.stats.conversions : 0,
        conversionRate: 0,
        totalProducts: productsData.success ? productsData.products.length : 0,
        currency: statsData.success ? statsData.stats.currency : 'LEI'
      }
    }];
    
  } catch (error) {
    console.error('Failed to load store:', error);
  } finally {
    loading.value = false;
  }
}

function openEditModal() {
  if (stores.value.length > 0) {
    const store = stores.value[0];
    editForm.value = {
      name: store.name || '',
      url: store.url || '',
      apiKey: store.apiKey || ''
    };
    editingStore.value = true;
  }
}

function closeEditModal() {
  editingStore.value = false;
}

async function saveStore() {
  try {
    const storeId = localStorage.getItem('storeId');
    if (!storeId) return;
    
    // Update in Firebase (API Key is readonly, don't update it)
    await updateDoc(doc(db, 'stores', storeId), {
      name: editForm.value.name,
      url: editForm.value.url,
      updatedAt: new Date()
    });
    
    // Reload store
    await loadStore();
    closeEditModal();
    
    alert('Store updated successfully!');
  } catch (error) {
    console.error('Failed to update store:', error);
    alert('Failed to update store');
  }
}

async function createStore() {
  try {
    creatingStore.value = true;
    const userId = authStore.userId;
    
    if (!userId) {
      alert('Please login first');
      return;
    }
    
    // Generate API Key
    const apiKey = generateApiKey();
    
    // Create store in Firebase with userId as document ID
    await setDoc(doc(db, 'stores', userId), {
      storeId: userId,
      userId: userId,
      name: 'My Store',
      url: '',
      apiKey: apiKey,
      plan: 'starter',
      status: 'active',
      createdAt: new Date(),
      stats: {
        totalRevenue: 0,
        totalProducts: 0,
        conversions: 0,
        conversionRate: 0,
        currency: 'LEI'
      }
    });
    
    // Set storeId in localStorage
    localStorage.setItem('storeId', userId);
    
    // Reload store
    await loadStore();
    
    alert('Store created successfully! Copy your API Key and paste it in your WooCommerce plugin.');
  } catch (error) {
    console.error('Failed to create store:', error);
    alert('Failed to create store');
  } finally {
    creatingStore.value = false;
  }
}

function generateApiKey(): string {
  const prefix = 'sk_live_';
  const randomString = Array.from({ length: 32 }, () => 
    Math.random().toString(36).charAt(2)
  ).join('');
  return prefix + randomString;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    alert('Copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy:', err);
  });
}

function formatDate(date: any) {
  if (!date) return '';
  // Handle Firebase Timestamp
  if (date.toDate) {
    return date.toDate().toLocaleDateString();
  }
  // Handle regular Date
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  // Handle timestamp seconds
  if (date._seconds) {
    return new Date(date._seconds * 1000).toLocaleDateString();
  }
  return '';
}

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
      <button 
        v-if="stores.length === 0"
        @click="createStore"
        :disabled="creatingStore"
        class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
      >
        <span class="text-xl">+</span>
        <span>{{ creatingStore ? 'Creating...' : 'Create Store' }}</span>
      </button>
      <button 
        v-else
        @click="openEditModal"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span class="text-xl">⚙️</span>
        <span>Edit Store</span>
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

    <!-- Empty State -->
    <div v-if="!loading && stores.length === 0" class="text-center py-12">
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-12">
        <div class="text-6xl mb-4">🏪</div>
        <h3 class="text-2xl font-bold text-white mb-2">No Store Yet</h3>
        <p class="text-gray-400 mb-6">Create your first store to start using UpSell AI</p>
        <button 
          @click="createStore"
          :disabled="creatingStore"
          class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {{ creatingStore ? 'Creating...' : '+ Create Your First Store' }}
        </button>
      </div>
    </div>

    <!-- Stores Grid -->
    <div v-if="stores.length > 0" class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

        <!-- Store ID -->
        <div class="mb-4">
          <p class="text-xs text-gray-400 mb-1">Store ID</p>
          <div class="flex items-center gap-2">
            <code class="text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded flex-1 truncate">{{ store.storeId }}</code>
            <button class="text-gray-400 hover:text-white transition" @click="copyToClipboard(store.storeId)">📋</button>
          </div>
        </div>

        <!-- API Key -->
        <div class="mb-4">
          <p class="text-xs text-gray-400 mb-1">API Key</p>
          <div class="flex items-center gap-2">
            <code class="text-xs text-gray-300 bg-gray-800/50 px-2 py-1 rounded flex-1 truncate">{{ store.apiKey }}</code>
            <button class="text-gray-400 hover:text-white transition" @click="copyToClipboard(store.apiKey)">📋</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
          <button 
            @click="openEditModal"
            class="flex-1 bg-blue-600/20 text-blue-400 px-3 py-2 rounded-lg hover:bg-blue-600/30 transition text-sm"
          >
            Edit Details
          </button>
          <button class="bg-gray-800/50 text-gray-400 px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm">
            ⚙️
          </button>
        </div>

        <!-- Created Date -->
        <p class="text-xs text-gray-500 mt-4" v-if="store.createdAt">
          Created {{ formatDate(store.createdAt) }}
        </p>
      </div>
    </div>

    <!-- Edit Store Modal -->
    <div 
      v-if="editingStore"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditModal"
    >
      <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 max-w-md w-full">
        <h3 class="text-xl font-bold text-white mb-4">Edit Store Details</h3>
        
        <div class="space-y-4">
          <!-- Store Name -->
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Store Name</label>
            <input 
              v-model="editForm.name"
              type="text"
              placeholder="My Store"
              class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <!-- Store URL -->
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">WooCommerce URL</label>
            <input 
              v-model="editForm.url"
              type="url"
              placeholder="https://yourstore.com"
              class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <!-- API Key (readonly) -->
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">API Key (read-only)</label>
            <div class="flex items-center gap-2">
              <input 
                v-model="editForm.apiKey"
                type="text"
                readonly
                class="flex-1 px-4 py-2 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-400 cursor-not-allowed"
              />
              <button 
                @click="copyToClipboard(editForm.apiKey)"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                📋 Copy
              </button>
            </div>
            <p class="text-xs text-gray-500 mt-1">API Key cannot be changed</p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex gap-3 mt-6">
          <button 
            @click="closeEditModal"
            class="flex-1 px-4 py-2 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button 
            @click="saveStore"
            class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
