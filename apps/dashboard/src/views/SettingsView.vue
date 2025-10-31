<script setup lang="ts">
import { ref } from 'vue';

// Mock user data - will be replaced with Firebase Auth data
const user = ref({
  userId: 'user_123',
  email: 'alex@electronics.com',
  displayName: 'Alex Johnson',
  plan: 'growth',
  createdAt: new Date('2025-09-15')
});

// Mock API keys - will come from Firestore
const apiKeys = ref([
  {
    keyId: 'key_001',
    key: 'sk_live_abc123def456ghi789...',
    name: 'Production Key',
    createdAt: new Date('2025-09-15'),
    lastUsed: new Date('2025-10-31')
  },
  {
    keyId: 'key_002',
    key: 'sk_test_xyz789uvw456rst123...',
    name: 'Test Key',
    createdAt: new Date('2025-10-01'),
    lastUsed: new Date('2025-10-30')
  }
]);

const notifications = ref({
  emailOnConversion: true,
  emailWeeklyReport: true,
  emailMonthlyReport: false,
  pushNotifications: true
});

const billing = ref({
  plan: 'growth',
  price: 79,
  nextBillingDate: new Date('2025-11-15'),
  paymentMethod: '**** **** **** 4242'
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-3xl font-bold text-white">Settings</h1>
      <p class="text-gray-400 mt-1">Manage your account and preferences</p>
    </div>

    <!-- Account Settings -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
      <h2 class="text-xl font-semibold text-white mb-6">Account Settings</h2>
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Email</label>
          <input 
            type="email" 
            v-model="user.email"
            class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
          <input 
            type="text" 
            v-model="user.displayName"
            class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-2">User ID</label>
          <input 
            type="text" 
            :value="user.userId"
            disabled
            class="w-full px-4 py-2 bg-gray-800/30 border border-gray-700 rounded-lg text-gray-500"
          />
        </div>
        <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Save Changes
        </button>
      </div>
    </div>

    <!-- API Keys -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-xl font-semibold text-white">API Keys</h2>
          <p class="text-gray-400 text-sm mt-1">Manage your API keys for WooCommerce integration</p>
        </div>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          <span class="text-xl">+</span>
          <span>Generate New Key</span>
        </button>
      </div>
      
      <div class="space-y-4">
        <div 
          v-for="apiKey in apiKeys" 
          :key="apiKey.keyId"
          class="bg-gray-800/30 border border-gray-700 rounded-lg p-4"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-white font-medium mb-1">{{ apiKey.name }}</h3>
              <p class="text-xs text-gray-400">Created {{ apiKey.createdAt.toLocaleDateString() }}</p>
            </div>
            <button class="text-red-400 hover:text-red-300 text-sm">🗑️ Delete</button>
          </div>
          <div class="flex items-center gap-2">
            <code class="flex-1 text-sm text-gray-300 bg-gray-900/50 px-3 py-2 rounded font-mono">{{ apiKey.key }}</code>
            <button class="text-gray-400 hover:text-white transition">📋</button>
          </div>
          <p class="text-xs text-gray-500 mt-2">Last used: {{ apiKey.lastUsed.toLocaleDateString() }}</p>
        </div>
      </div>
    </div>

    <!-- Notifications -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
      <h2 class="text-xl font-semibold text-white mb-6">Notifications</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Email on Conversion</p>
            <p class="text-sm text-gray-400">Get notified when a recommendation converts</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="notifications.emailOnConversion" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Weekly Report</p>
            <p class="text-sm text-gray-400">Receive weekly performance summary</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="notifications.emailWeeklyReport" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Monthly Report</p>
            <p class="text-sm text-gray-400">Receive monthly analytics report</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="notifications.emailMonthlyReport" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div class="flex items-center justify-between">
          <div>
            <p class="text-white font-medium">Push Notifications</p>
            <p class="text-sm text-gray-400">Enable browser push notifications</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="notifications.pushNotifications" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>

    <!-- Billing -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
      <h2 class="text-xl font-semibold text-white mb-6">Billing & Subscription</h2>
      <div class="space-y-6">
        <!-- Current Plan -->
        <div class="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-2xl font-bold text-white">{{ billing.plan.toUpperCase() }} Plan</h3>
              <p class="text-gray-300 mt-1">${{ billing.price }}/month</p>
            </div>
            <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              Upgrade Plan
            </button>
          </div>
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-gray-400">Next billing date</p>
              <p class="text-white font-medium">{{ billing.nextBillingDate.toLocaleDateString() }}</p>
            </div>
            <div>
              <p class="text-gray-400">Payment method</p>
              <p class="text-white font-medium">{{ billing.paymentMethod }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex gap-3">
          <button class="flex-1 bg-gray-800/50 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            Update Payment Method
          </button>
          <button class="flex-1 bg-gray-800/50 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-800 transition">
            View Invoices
          </button>
        </div>

        <!-- Danger Zone -->
        <div class="border-t border-gray-800 pt-6">
          <h3 class="text-lg font-semibold text-red-400 mb-3">Danger Zone</h3>
          <button class="bg-red-600/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-600/30 transition">
            Cancel Subscription
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
