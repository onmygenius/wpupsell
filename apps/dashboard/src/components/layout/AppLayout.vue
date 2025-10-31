<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Analytics', path: '/analytics', icon: '📈' },
  { name: 'Stores', path: '/stores', icon: '🏪' },
  { name: 'Settings', path: '/settings', icon: '⚙️' }
];

const isActive = (path: string) => {
  return route.path === path;
};
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-white shadow-lg">
      <div class="p-6">
        <div class="flex items-center gap-2 mb-8">
          <span class="text-3xl">🚀</span>
          <div>
            <h1 class="text-xl font-bold text-gray-900">WPUpsell</h1>
            <p class="text-xs text-gray-500">AI-Powered Upsells</p>
          </div>
        </div>

        <nav class="space-y-2">
          <RouterLink
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            :class="[
              'flex items-center gap-3 px-4 py-3 rounded-lg transition',
              isActive(item.path)
                ? 'bg-blue-50 text-blue-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-50'
            ]"
          >
            <span class="text-xl">{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </RouterLink>
        </nav>
      </div>

      <!-- User Section -->
      <div class="absolute bottom-0 w-64 p-6 border-t border-gray-200">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
            U
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-900">User</p>
            <p class="text-xs text-gray-500">Free Plan</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-8">
      <RouterView />
    </main>
  </div>
</template>
