<script setup lang="ts">
// Stores management page
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Stores</h1>
        <p class="text-gray-600 mt-1">Manage your connected WooCommerce stores</p>
      </div>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
        + Add Store
      </button>
    </div>

    <div class="bg-white rounded-lg shadow p-12 text-center">
      <div class="text-6xl mb-4">🏪</div>
      <h2 class="text-2xl font-semibold text-gray-900 mb-2">No Stores Connected</h2>
      <p class="text-gray-600 mb-6">Connect your first WooCommerce store to get started</p>
      <button class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
        Connect Store
      </button>
    </div>
  </div>
</template>
