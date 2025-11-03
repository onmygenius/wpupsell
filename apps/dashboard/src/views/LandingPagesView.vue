<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const API_URL = 'https://wpupsell-dashboard.vercel.app/api';
const STORE_ID = authStore.userId; // Use userId as storeId - 100% dynamic!

const loading = ref(true);
const landingPages = ref<any[]>([]);
const showGenerateModal = ref(false);
const products = ref<any[]>([]);
const searchQuery = ref('');
const selectedProduct = ref<any>(null);
const pageTitle = ref('');
const pageSlug = ref('');
const urlPrefix = ref('offers');
const generating = ref(false);
const showEditModal = ref(false);
const editingPage = ref<any>(null);
const editedContent = ref<any>(null);
const uploadingImage = ref(false);
const store = ref<any>(null);
const activeTab = ref('description');
const selectedTemplate = ref('');

// Bulk generation
const showBulkModal = ref(false);
const bulkGenerating = ref(false);
const bulkNumberOfPages = ref(10);
const bulkProgress = ref(0);
const bulkResults = ref<any[]>([]);

// Available templates
const templates = [
  { id: 'starter', name: 'Starter', description: 'Modern, clean design with Tailwind CSS - Perfect for any product' }
];

onMounted(async () => {
  await Promise.all([
    loadStore(),
    loadLandingPages(),
    loadProducts()
  ]);
});

async function loadStore() {
  if (!STORE_ID) return;
  
  try {
    // Import Firebase (lazy load)
    const { doc, getDoc } = await import('firebase/firestore');
    const { db } = await import('../firebase/config');
    
    const storeDoc = await getDoc(doc(db, 'stores', STORE_ID));
    if (storeDoc.exists()) {
      store.value = { id: storeDoc.id, ...storeDoc.data() };
    }
  } catch (error) {
    console.error('Failed to load store:', error);
  }
}

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
  if (!STORE_ID) {
    console.log('❌ No storeId - cannot load products');
    return;
  }

  try {
    console.log('🔍 Loading products for landing pages from store:', STORE_ID);
    
    const productsSnapshot = await getDocs(
      collection(db, 'stores', STORE_ID, 'products')
    );
    
    products.value = productsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        productId: doc.id, // Use document ID as productId
        name: data.name || '',
        price: data.price || 0,
        image: data.image,
        category: data.category || '',
      };
    });
    
    console.log('✅ Products loaded for landing pages:', products.value.length);
  } catch (error) {
    console.error('❌ Failed to load products:', error);
  }
}

function openGenerateModal() {
  showGenerateModal.value = true;
  searchQuery.value = '';
  selectedProduct.value = null;
  pageTitle.value = '';
  pageSlug.value = '';
  urlPrefix.value = 'offers';
  selectedTemplate.value = '';
}

function closeGenerateModal() {
  showGenerateModal.value = false;
}

function selectProduct(product: any) {
  selectedProduct.value = product;
  pageTitle.value = `${product.name} - Special Offer`;
  pageSlug.value = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '-offer';
  searchQuery.value = ''; // Close dropdown after selection
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
  const baseUrl = store.value?.url?.replace(/^https?:\/\//, '').replace(/\/$/, '') || 'yourstore.com';
  return `${baseUrl}/${prefix}${pageSlug.value}`;
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
        templateId: selectedTemplate.value,
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

function viewHTML(page: any) {
  if (page.html) {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(page.html);
      newWindow.document.close();
    }
  }
}

function downloadHTML(page: any) {
  if (page.html) {
    const blob = new Blob([page.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${page.pageSlug}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function openEditModal(page: any) {
  editingPage.value = page;
  editedContent.value = JSON.parse(JSON.stringify(page.content)); // Deep clone
  showEditModal.value = true;
}

function closeEditModal() {
  showEditModal.value = false;
  editingPage.value = null;
  editedContent.value = null;
}

async function saveChanges() {
  if (!editingPage.value || !editedContent.value) return;
  
  try {
    const response = await fetch(`${API_URL}/landing-pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        storeId: STORE_ID,
        landingPageId: editingPage.value.id,
        content: editedContent.value,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Modificări salvate cu succes!');
      closeEditModal();
      await loadLandingPages();
    } else {
      alert('Eroare la salvare: ' + data.error);
    }
  } catch (error) {
    console.error('Failed to save changes:', error);
    alert('Eroare la salvare');
  }
}

async function uploadImage(event: any) {
  const file = event.target.files[0];
  if (!file) return;
  
  uploadingImage.value = true;
  
  try {
    // Convert to base64 for now (în producție ar trebui să folosim Firebase Storage)
    const reader = new FileReader();
    reader.onload = (e) => {
      if (editedContent.value && e.target?.result) {
        if (!editedContent.value.gallery) {
          editedContent.value.gallery = [];
        }
        editedContent.value.gallery.push(e.target.result);
        uploadingImage.value = false;
      }
    };
    reader.readAsDataURL(file);
  } catch (error) {
    console.error('Failed to upload image:', error);
    uploadingImage.value = false;
  }
}

function removeImage(index: number) {
  if (editedContent.value?.gallery) {
    editedContent.value.gallery.splice(index, 1);
  }
}

// Bulk Generation Functions
function openBulkModal() {
  showBulkModal.value = true;
  bulkNumberOfPages.value = 10;
  bulkProgress.value = 0;
  bulkResults.value = [];
}

function closeBulkModal() {
  if (!bulkGenerating.value) {
    showBulkModal.value = false;
  }
}

async function startBulkGeneration() {
  if (!STORE_ID) {
    alert('Store ID not found');
    return;
  }

  if (bulkNumberOfPages.value < 1 || bulkNumberOfPages.value > 100) {
    alert('Number of pages must be between 1 and 100');
    return;
  }

  bulkGenerating.value = true;
  bulkProgress.value = 0;
  bulkResults.value = [];

  const totalPages = bulkNumberOfPages.value;
  const chunkSize = 3; // Generate 3 pages per request
  let offset = 0;

  try {
    console.log(`🚀 Starting bulk generation of ${totalPages} pages...`);

    // Loop until all pages are generated
    while (offset < totalPages) {
      console.log(`📄 Generating chunk: ${offset + 1}-${Math.min(offset + chunkSize, totalPages)} of ${totalPages}`);

      const response = await fetch(`${API_URL}/bulk-generate-pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: STORE_ID,
          numberOfPages: totalPages,
          offset: offset
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Add results to the list
        bulkResults.value.push(...data.results);
        
        // Update progress
        offset += data.totalGenerated;
        bulkProgress.value = Math.round((offset / totalPages) * 100);
        
        console.log(`✅ Generated ${offset}/${totalPages} pages`);
      } else {
        alert('Failed to generate pages: ' + data.error);
        break;
      }

      // Small delay between chunks
      if (offset < totalPages) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const successCount = bulkResults.value.filter((r: any) => r.status === 'success').length;
    alert(`✅ Success! Generated ${successCount} out of ${totalPages} pages!`);
    
    // Reload landing pages
    await loadLandingPages();
  } catch (error) {
    console.error('Failed to bulk generate:', error);
    alert('Failed to generate pages. Please try again.');
  } finally {
    bulkGenerating.value = false;
  }
}

async function deleteLandingPage(pageId: string) {
  if (!confirm('Sigur vrei să ștergi această landing page?')) {
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/landing-pages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'delete',
        storeId: STORE_ID,
        landingPageId: pageId,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert('Landing page șters cu succes!');
      await loadLandingPages();
    } else {
      alert('Eroare la ștergere: ' + data.error);
    }
  } catch (error) {
    console.error('Failed to delete landing page:', error);
    alert('Eroare la ștergere');
  }
}

const publishing = ref(false);

async function publishToWordPress(page: any) {
  if (!confirm('Sigur vrei să publici această landing page în WordPress?')) {
    return;
  }
  
  publishing.value = true;
  
  try {
    const response = await fetch(`${API_URL}/publish-to-wordpress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        landingPageId: page.id,
        storeId: STORE_ID,
      }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      alert(`✅ Landing page publicată cu succes!\n\nURL: ${data.publishedUrl}`);
      await loadLandingPages();
    } else {
      alert(`❌ Eroare la publicare:\n\n${data.message || data.error}`);
    }
  } catch (error) {
    console.error('Failed to publish to WordPress:', error);
    alert('❌ Eroare la publicare în WordPress');
  } finally {
    publishing.value = false;
  }
}

function viewLivePage(url: string) {
  window.open(url, '_blank');
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
      <div class="flex gap-3">
        <button 
          @click="openGenerateModal"
          class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
        >
          <span class="text-xl">📦</span>
          Generate Product Page
        </button>
        <button 
          @click="openBulkModal"
          class="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          <span class="text-xl">🚀</span>
          Generate SEO Pages
        </button>
      </div>
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
            <h3 class="text-xl font-semibold text-white mb-2">{{ page.pageTitle || 'Untitled' }}</h3>
            <p class="text-sm text-blue-400 mb-3">🔗 {{ page.fullUrl || page.pageSlug }}</p>
            
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
            <button 
              @click="openEditModal(page)"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" 
              title="Edit"
            >
              ✏️
            </button>
            <button 
              @click="viewHTML(page)"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" 
              title="View HTML"
            >
              👁️
            </button>
            <button 
              @click="downloadHTML(page)"
              class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" 
              title="Download HTML"
            >
              💾
            </button>
            <button class="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition" title="Stats">
              📊
            </button>
            
            <!-- Publish to WordPress / View Live Page -->
            <button 
              v-if="page.status !== 'published'"
              @click="publishToWordPress(page)"
              :disabled="publishing"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed" 
              title="Publish to WordPress"
            >
              {{ publishing ? '⏳ Publishing...' : '📤 Publish' }}
            </button>
            <button 
              v-else
              @click="viewLivePage(page.publishedUrl)"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition" 
              title="View Live Page"
            >
              🌐 View Live
            </button>
            
            <button 
              @click="deleteLandingPage(page.id)"
              class="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition" 
              title="Delete"
            >
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
                <p class="text-sm text-gray-400">{{ product.price }} {{ store?.currency || 'LEI' }} - {{ product.category }}</p>
              </button>
            </div>
            
            <!-- Selected Product -->
            <div v-if="selectedProduct" class="mt-2 bg-green-600/20 border border-green-600/50 rounded-lg px-4 py-3">
              <p class="text-green-400 font-medium">✅ Selected: {{ selectedProduct.name }}</p>
              <p class="text-sm text-gray-400">{{ selectedProduct.price }} {{ store?.currency || 'LEI' }}</p>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Page Title</label>
            <input 
              v-model="pageTitle"
              type="text" 
              placeholder="Pearl Elegance Necklace - Special Offer"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            />
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">URL Slug</label>
            <input 
              v-model="pageSlug"
              @input="sanitizeSlug"
              type="text" 
              placeholder="pearl-elegance-necklace-offer"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            />
            <p class="text-xs text-gray-500 mt-1">Only lowercase letters, numbers, and hyphens</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Template</label>
            <select v-model="selectedTemplate" class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none">
              <option value="" disabled>Choose template...</option>
              <option v-for="template in templates" :key="template.id" :value="template.id">
                {{ template.name }}
              </option>
            </select>
            <p class="text-xs text-gray-500 mt-1">{{ selectedTemplate ? templates.find(t => t.id === selectedTemplate)?.description : 'Select a template to see description' }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">URL Prefix (optional)</label>
            <select v-model="urlPrefix" class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none">
              <option value="">No prefix</option>
              <option value="offers">offers</option>
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

    <!-- Edit Modal -->
    <div v-if="showEditModal && editedContent" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto" @click.self="closeEditModal">
      <div class="bg-[#0a0f2e] rounded-xl border border-gray-800 p-8 max-w-4xl w-full mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white">✏️ Edit Landing Page</h2>
          <button @click="closeEditModal" class="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <!-- Tabs -->
        <div class="flex gap-2 mb-6 border-b border-gray-800">
          <button 
            @click="activeTab = 'description'"
            :class="['px-4 py-2 transition', activeTab === 'description' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400 hover:text-white']"
          >
            📝 Description
          </button>
          <button 
            @click="activeTab = 'benefits'"
            :class="['px-4 py-2 transition', activeTab === 'benefits' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400 hover:text-white']"
          >
            ✨ Benefits
          </button>
          <button 
            @click="activeTab = 'gallery'"
            :class="['px-4 py-2 transition', activeTab === 'gallery' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400 hover:text-white']"
          >
            🖼️ Gallery
          </button>
          <button 
            @click="activeTab = 'faq'"
            :class="['px-4 py-2 transition', activeTab === 'faq' ? 'text-white border-b-2 border-blue-600' : 'text-gray-400 hover:text-white']"
          >
            ❓ FAQ
          </button>
        </div>

        <!-- Description Editor -->
        <div v-show="activeTab === 'description'" class="space-y-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Hero Headline</label>
            <input
              v-model="editedContent.hero.headline"
              type="text"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Hero Subheadline</label>
            <input
              v-model="editedContent.hero.subheadline"
              type="text"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">CTA Button Text</label>
            <input
              v-model="editedContent.hero.cta"
              type="text"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">Product Description</label>
            <textarea
              v-model="editedContent.description"
              rows="6"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none"
            ></textarea>
          </div>
        </div>

        <!-- Benefits Editor -->
        <div v-show="activeTab === 'benefits'" class="space-y-4 mb-6">
          <h3 class="text-lg font-semibold text-white mb-4">✨ Benefits</h3>
          <div v-for="(benefit, index) in editedContent.benefits" :key="index" class="bg-[#0f1535] border border-gray-800 rounded-lg p-4">
            <div class="flex items-center gap-4 mb-3">
              <input
                v-model="benefit.icon"
                type="text"
                placeholder="Icon"
                class="w-20 bg-[#0a0f2e] border border-gray-700 rounded px-3 py-2 text-white text-center"
              />
              <input
                v-model="benefit.title"
                type="text"
                placeholder="Benefit Title"
                class="flex-1 bg-[#0a0f2e] border border-gray-700 rounded px-3 py-2 text-white"
              />
            </div>
            <textarea
              v-model="benefit.description"
              rows="2"
              placeholder="Benefit Description"
              class="w-full bg-[#0a0f2e] border border-gray-700 rounded px-3 py-2 text-white"
            ></textarea>
          </div>
        </div>

        <!-- Image Gallery -->
        <div v-show="activeTab === 'gallery'" class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-4">🖼️ Image Gallery</h3>
          
          <div class="grid grid-cols-3 gap-4 mb-4">
            <div v-for="(image, index) in editedContent.gallery || []" :key="index" class="relative group">
              <img :src="image" class="w-full h-32 object-cover rounded-lg" />
              <button
                @click="removeImage(index)"
                class="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                ×
              </button>
            </div>
          </div>

          <label class="block">
            <input
              type="file"
              accept="image/*"
              @change="uploadImage"
              class="hidden"
            />
            <div class="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-blue-600 transition">
              <p class="text-gray-400">
                {{ uploadingImage ? '💾 Uploading...' : '📷 Click to upload image' }}
              </p>
            </div>
          </label>
        </div>

        <!-- FAQ Editor -->
        <div v-show="activeTab === 'faq'" class="space-y-4 mb-6">
          <h3 class="text-lg font-semibold text-white mb-4">❓ FAQ</h3>
          <div v-for="(item, index) in editedContent.faq" :key="index" class="bg-[#0f1535] border border-gray-800 rounded-lg p-4">
            <input
              v-model="item.question"
              type="text"
              placeholder="Question"
              class="w-full bg-[#0a0f2e] border border-gray-700 rounded px-3 py-2 text-white mb-2"
            />
            <textarea
              v-model="item.answer"
              rows="2"
              placeholder="Answer"
              class="w-full bg-[#0a0f2e] border border-gray-700 rounded px-3 py-2 text-white"
            ></textarea>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-4">
          <button
            @click="saveChanges"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition"
          >
            💾 Save Changes
          </button>
          <button
            @click="closeEditModal"
            class="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Generate Modal -->
    <div v-if="showBulkModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" @click.self="closeBulkModal">
      <div class="bg-[#0a0f2e] rounded-xl border border-gray-800 p-8 max-w-2xl w-full mx-4" @click.stop>
        <h2 class="text-2xl font-bold text-white mb-6">🚀 Bulk Generate Promotional Pages</h2>
        
        <div class="space-y-6">
          <!-- Info -->
          <div class="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
            <p class="text-blue-300 text-sm">
              Generate multiple UNIQUE promotional pages for your store. Each page will have:
            </p>
            <ul class="text-blue-300 text-sm mt-2 space-y-1 list-disc list-inside">
              <li>Unique title and content (1000-1500 words)</li>
              <li>2-3 products mentioned with links</li>
              <li>Strong CTA and persuasive copy</li>
              <li>Published directly to WordPress</li>
            </ul>
          </div>

          <!-- Number of Pages -->
          <div>
            <label class="block text-sm font-medium text-gray-400 mb-2">
              Number of Pages to Generate
            </label>
            <input
              v-model.number="bulkNumberOfPages"
              type="number"
              min="1"
              max="100"
              :disabled="bulkGenerating"
              class="w-full bg-[#0f1535] border border-gray-800 rounded-lg px-4 py-3 text-white focus:border-blue-600 focus:outline-none disabled:opacity-50"
              placeholder="10"
            />
            <p class="text-xs text-gray-500 mt-1">Choose between 1 and 100 pages</p>
          </div>

          <!-- Progress -->
          <div v-if="bulkGenerating" class="space-y-2">
            <div class="flex justify-between text-sm text-gray-400">
              <span>Generating pages...</span>
              <span>{{ bulkProgress }}%</span>
            </div>
            <div class="w-full bg-gray-800 rounded-full h-2">
              <div 
                class="bg-green-600 h-2 rounded-full transition-all duration-300"
                :style="{ width: bulkProgress + '%' }"
              ></div>
            </div>
          </div>

          <!-- Results -->
          <div v-if="bulkResults.length > 0" class="max-h-64 overflow-y-auto space-y-2">
            <div 
              v-for="result in bulkResults" 
              :key="result.pageNumber"
              class="bg-[#0f1535] border border-gray-800 rounded-lg p-3 text-sm"
            >
              <div class="flex items-center justify-between">
                <span class="text-white font-medium">Page {{ result.pageNumber }}: {{ result.title }}</span>
                <span v-if="result.status === 'success'" class="text-green-400">✓</span>
                <span v-else class="text-red-400">✗</span>
              </div>
              <a 
                v-if="result.url" 
                :href="result.url" 
                target="_blank"
                class="text-blue-400 hover:underline text-xs"
              >
                {{ result.url }}
              </a>
              <p v-if="result.error" class="text-red-400 text-xs mt-1">{{ result.error }}</p>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-4">
            <button
              v-if="!bulkGenerating"
              @click="startBulkGeneration"
              class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-semibold"
            >
              🚀 Start Generation
            </button>
            <button
              v-if="!bulkGenerating"
              @click="closeBulkModal"
              class="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              v-if="bulkGenerating"
              disabled
              class="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg cursor-not-allowed opacity-50"
            >
              ⏳ Generating...
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
