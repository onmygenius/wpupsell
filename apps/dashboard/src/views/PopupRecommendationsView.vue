<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const authStore = useAuthStore();

const popupSettings = ref({
  popupEnabled: true,
  maxRecommendations: 3,
  
  // Timing
  initialDelay: 2,        // seconds
  cooldownTime: 10,       // seconds
  sessionLimit: 1,        // max popups per session
  
  // Triggers
  exitIntentEnabled: true,
  scrollTriggerEnabled: true,
  scrollTriggerPercent: 0,  // 0 = instant
  postCartEnabled: true,
  timeTriggerEnabled: true,
  timeTriggerDelay: 2      // seconds
});

const savingPopupSettings = ref(false);

async function loadPopupSettings() {
  try {
    const storeDoc = await getDoc(doc(db, 'stores', authStore.userId));
    if (storeDoc.exists()) {
      const data = storeDoc.data();
      const settings = data.settings || {};
      
      // Load all settings with defaults
      popupSettings.value = {
        popupEnabled: settings.popupEnabled !== false,
        maxRecommendations: settings.maxRecommendations || 3,
        initialDelay: settings.initialDelay || 2,
        cooldownTime: settings.cooldownTime || 10,
        sessionLimit: settings.sessionLimit || 1,
        exitIntentEnabled: settings.exitIntentEnabled !== false,
        scrollTriggerEnabled: settings.scrollTriggerEnabled !== false,
        scrollTriggerPercent: settings.scrollTriggerPercent || 0,
        postCartEnabled: settings.postCartEnabled !== false,
        timeTriggerEnabled: settings.timeTriggerEnabled !== false,
        timeTriggerDelay: settings.timeTriggerDelay || 2
      };
    }
  } catch (error) {
    console.error('Error loading popup settings:', error);
  }
}

async function savePopupSettings() {
  savingPopupSettings.value = true;
  try {
    await updateDoc(doc(db, 'stores', authStore.userId), {
      'settings.popupEnabled': popupSettings.value.popupEnabled,
      'settings.maxRecommendations': popupSettings.value.maxRecommendations,
      'settings.initialDelay': popupSettings.value.initialDelay,
      'settings.cooldownTime': popupSettings.value.cooldownTime,
      'settings.sessionLimit': popupSettings.value.sessionLimit,
      'settings.exitIntentEnabled': popupSettings.value.exitIntentEnabled,
      'settings.scrollTriggerEnabled': popupSettings.value.scrollTriggerEnabled,
      'settings.scrollTriggerPercent': popupSettings.value.scrollTriggerPercent,
      'settings.postCartEnabled': popupSettings.value.postCartEnabled,
      'settings.timeTriggerEnabled': popupSettings.value.timeTriggerEnabled,
      'settings.timeTriggerDelay': popupSettings.value.timeTriggerDelay,
      'settings.updatedAt': new Date()
    });
    alert('✅ Pop-up settings saved successfully!');
  } catch (error) {
    console.error('Error saving popup settings:', error);
    alert('❌ Failed to save settings. Please try again.');
  } finally {
    savingPopupSettings.value = false;
  }
}

onMounted(async () => {
  await loadPopupSettings();
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white">🎯 Pop-up Recommendations</h1>
        <p class="text-gray-400 mt-1">Configure how and when product recommendations appear to your customers</p>
      </div>
      <button 
        @click="savePopupSettings"
        :disabled="savingPopupSettings"
        class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {{ savingPopupSettings ? 'Saving...' : '💾 Save All Settings' }}
      </button>
    </div>

    <!-- Enable/Disable Card -->
    <div class="bg-gradient-to-br from-[#0f1535] to-[#1a1f3a] rounded-2xl border border-gray-800/50 p-8 shadow-xl hover:shadow-2xl transition-all hover:border-blue-500/30">
      <div class="flex items-center justify-between">
        <div class="flex items-start space-x-4">
          <div class="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <span class="text-2xl">🚀</span>
          </div>
          <div>
            <h3 class="text-xl font-bold text-white mb-2">Enable Pop-up Recommendations</h3>
            <p class="text-gray-400 text-sm leading-relaxed">Show AI-powered product recommendations to your customers. Toggle this to enable or disable all pop-up functionality.</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer ml-6">
          <input type="checkbox" v-model="popupSettings.popupEnabled" class="sr-only peer">
          <div class="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-blue-700"></div>
        </label>
      </div>
    </div>

    <!-- Display + Timing Grid -->
    <div class="grid md:grid-cols-2 gap-6">
      <!-- Display Settings Card -->
      <div class="bg-gradient-to-br from-[#0f1535] to-[#1a1f3a] rounded-2xl border border-gray-800/50 p-8 shadow-xl hover:shadow-2xl transition-all hover:border-purple-500/30">
      <div class="flex items-start space-x-4 mb-6">
        <div class="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span class="text-2xl">📊</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Display Settings</h3>
          <p class="text-gray-400 text-sm">Control how many products are shown in the recommendation pop-up</p>
        </div>
      </div>
      
      <div class="ml-16">
        <label class="block text-sm font-semibold text-gray-300 mb-3">Number of Products to Show</label>
        <select 
          v-model="popupSettings.maxRecommendations"
          class="w-full px-5 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all hover:bg-gray-800/70"
        >
          <option :value="1">1 Product</option>
          <option :value="2">2 Products</option>
          <option :value="3">3 Products (Recommended)</option>
          <option :value="4">4 Products</option>
          <option :value="5">5 Products</option>
        </select>
        <div class="mt-3 flex items-start space-x-2">
          <span class="text-yellow-500 text-sm">💡</span>
          <p class="text-sm text-gray-400">Tip: 3 products is optimal for conversion rates</p>
        </div>
      </div>

      <!-- Timing Settings Card -->
    <div class="bg-gradient-to-br from-[#0f1535] to-[#1a1f3a] rounded-2xl border border-gray-800/50 p-8 shadow-xl hover:shadow-2xl transition-all hover:border-green-500/30">
      <div class="flex items-start space-x-4 mb-6">
        <div class="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span class="text-2xl">⏱️</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Timing Settings</h3>
          <p class="text-gray-400 text-sm">Configure delays, cooldowns, and session limits for optimal user experience</p>
        </div>
      </div>
      
      <div class="ml-16 space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-3">Initial Delay (seconds)</label>
          <input 
            type="number" 
            v-model.number="popupSettings.initialDelay"
            min="0"
            max="60"
            class="w-full px-5 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-gray-800/70"
          />
          <p class="text-sm text-gray-400 mt-2">How long to wait before showing pop-up (0 = instant)</p>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-3">Cooldown Time (seconds)</label>
          <input 
            type="number" 
            v-model.number="popupSettings.cooldownTime"
            min="0"
            max="3600"
            class="w-full px-5 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-gray-800/70"
          />
          <p class="text-sm text-gray-400 mt-2">Time to wait after user closes pop-up before showing again</p>
        </div>
        
        <div>
          <label class="block text-sm font-semibold text-gray-300 mb-3">Session Limit</label>
          <input 
            type="number" 
            v-model.number="popupSettings.sessionLimit"
            min="1"
            max="10"
            class="w-full px-5 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all hover:bg-gray-800/70"
          />
          <p class="text-sm text-gray-400 mt-2">Maximum number of pop-ups to show per user session</p>
        </div>
      </div>
    </div>

    <!-- Trigger Settings Card -->
    <div class="bg-gradient-to-br from-[#0f1535] to-[#1a1f3a] rounded-2xl border border-gray-800/50 p-8 shadow-xl hover:shadow-2xl transition-all hover:border-orange-500/30">
      <div class="flex items-start space-x-4 mb-6">
        <div class="w-12 h-12 bg-orange-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <span class="text-2xl">🎯</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-white mb-2">Trigger Settings</h3>
          <p class="text-gray-400 text-sm">Choose when and how the pop-up should appear to your customers</p>
        </div>
      </div>
      
      <div class="ml-16 space-y-6">
        <!-- Exit Intent -->
        <div class="bg-gray-800/30 rounded-xl p-5 hover:bg-gray-800/50 transition-all">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-lg">🚪</span>
                <p class="text-white font-semibold">Exit Intent Trigger</p>
              </div>
              <p class="text-sm text-gray-400">Show pop-up when user moves mouse to leave page</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer ml-4">
              <input type="checkbox" v-model="popupSettings.exitIntentEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-orange-700"></div>
            </label>
          </div>
        </div>

        <!-- Scroll Trigger -->
        <div class="bg-gray-800/30 rounded-xl p-5 hover:bg-gray-800/50 transition-all">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-lg">📜</span>
                <p class="text-white font-semibold">Scroll Trigger</p>
              </div>
              <p class="text-sm text-gray-400">Show pop-up when user scrolls to certain percentage</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer ml-4">
              <input type="checkbox" v-model="popupSettings.scrollTriggerEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-orange-700"></div>
            </label>
          </div>
          <div v-if="popupSettings.scrollTriggerEnabled" class="mt-4 pt-4 border-t border-gray-700/50">
            <label class="block text-sm font-medium text-gray-300 mb-2">Scroll Percentage (%)</label>
            <input 
              type="number" 
              v-model.number="popupSettings.scrollTriggerPercent"
              min="0"
              max="100"
              class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p class="text-sm text-gray-500 mt-2">0 = instant, 50 = halfway, 100 = bottom</p>
          </div>
        </div>

        <!-- Post-Cart Trigger -->
        <div class="bg-gray-800/30 rounded-xl p-5 hover:bg-gray-800/50 transition-all">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-lg">🛒</span>
                <p class="text-white font-semibold">Post-Cart Trigger</p>
              </div>
              <p class="text-sm text-gray-400">Show pop-up after user adds product to cart</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer ml-4">
              <input type="checkbox" v-model="popupSettings.postCartEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-orange-700"></div>
            </label>
          </div>
        </div>

        <!-- Time Trigger -->
        <div class="bg-gray-800/30 rounded-xl p-5 hover:bg-gray-800/50 transition-all">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <div class="flex items-center space-x-2 mb-2">
                <span class="text-lg">⏰</span>
                <p class="text-white font-semibold">Time Trigger (Fallback)</p>
              </div>
              <p class="text-sm text-gray-400">Show pop-up after user spends time on page</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer ml-4">
              <input type="checkbox" v-model="popupSettings.timeTriggerEnabled" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-orange-700"></div>
            </label>
          </div>
          <div v-if="popupSettings.timeTriggerEnabled" class="mt-4 pt-4 border-t border-gray-700/50">
            <label class="block text-sm font-medium text-gray-300 mb-2">Time Delay (seconds)</label>
            <input 
              type="number" 
              v-model.number="popupSettings.timeTriggerDelay"
              min="1"
              max="300"
              class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            <p class="text-sm text-gray-500 mt-2">Fallback trigger if no other trigger activates</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Info Box -->
    <div class="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-2xl p-6 shadow-lg">
      <div class="flex items-start space-x-3">
        <span class="text-2xl">💡</span>
        <div>
          <p class="text-blue-300 font-medium mb-1">Pro Tip</p>
          <p class="text-sm text-gray-300 leading-relaxed">
            Enable multiple triggers for best results. The pop-up will show when the <strong>FIRST</strong> trigger condition is met, giving you maximum flexibility to capture customer attention at the right moment.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
