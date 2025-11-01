<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const route = useRoute();
const authStore = useAuthStore();
const isCollapsed = ref(false);

const userInitial = computed(() => {
  return authStore.userEmail.charAt(0).toUpperCase() || 'U';
});

const userName = computed(() => {
  return authStore.userEmail.split('@')[0] || 'User';
});

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'Stores', path: '/stores', icon: '🏪' },
  { name: 'Products', path: '/products', icon: '📦' },
  { name: 'Settings', path: '/settings', icon: '⚙️' }
];

const isActive = (path: string) => {
  return route.path === path;
};

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<template>
  <div class="min-h-screen bg-[#0a0e27] flex">
    <!-- Sidebar -->
    <aside 
      :class="[
        'bg-[#0f1535] border-r border-gray-800 transition-all duration-300 ease-in-out relative',
        isCollapsed ? 'w-20' : 'w-64'
      ]"
    >
      <!-- Toggle Button -->
      <button
        @click="toggleSidebar"
        class="absolute -right-3 top-6 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition shadow-lg z-10"
      >
        <span class="text-xs">{{ isCollapsed ? '→' : '←' }}</span>
      </button>

      <div class="p-6">
        <!-- Logo -->
        <div :class="['flex items-center gap-2 mb-8 transition-all', isCollapsed ? 'justify-center' : '']">
          <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span class="text-xl">🚀</span>
          </div>
          <div v-if="!isCollapsed">
            <h1 class="text-lg font-bold text-white">UpSell AI</h1>
            <p class="text-xs text-gray-400">Pro Plan</p>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="space-y-2">
          <RouterLink
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-lg transition group relative',
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-600/30 to-blue-700/20 text-white font-semibold border-l-4 border-blue-500'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-white',
              isCollapsed ? 'justify-center' : ''
            ]"
            :title="isCollapsed ? item.name : ''"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span v-if="!isCollapsed" class="transition-opacity">{{ item.name }}</span>
            
            <!-- Tooltip when collapsed -->
            <div 
              v-if="isCollapsed"
              class="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
            >
              {{ item.name }}
            </div>
          </RouterLink>
        </nav>
      </div>

      <!-- User Section -->
      <div 
        :class="[
          'absolute bottom-0 p-6 border-t border-gray-800 transition-all',
          isCollapsed ? 'w-20' : 'w-64'
        ]"
      >
        <div :class="['flex items-center gap-3', isCollapsed ? 'justify-center' : '']">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {{ userInitial }}
          </div>
          <div v-if="!isCollapsed" class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-white truncate">{{ userName }}</p>
            <p class="text-xs text-gray-400">{{ authStore.userEmail }}</p>
          </div>
          <button 
            v-if="!isCollapsed"
            @click="authStore.logout()"
            class="text-gray-400 hover:text-white transition"
            title="Logout"
          >
            🚪
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8 overflow-auto bg-[#0a0e27]">
      <RouterView />
    </main>
  </div>
</template>
