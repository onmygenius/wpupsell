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
    <div>
      <h1 class="text-3xl font-bold text-white">🎯 Pop-up Recommendations</h1>
      <p class="text-gray-400 mt-1">Configure how and when product recommendations appear to your customers</p>
    </div>

    <!-- Pop-up Settings -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-semibold text-white">Settings</h2>
        <button 
          @click="savePopupSettings"
          :disabled="savingPopupSettings"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ savingPopupSettings ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
      
      <div class="space-y-6">
        <!-- Enable/Disable Pop-up -->
        <div class="flex items-center justify-between pb-4 border-b border-gray-800">
          <div>
            <p class="text-white font-medium">Enable Pop-up Recommendations</p>
            <p class="text-sm text-gray-400">Show AI-powered product recommendations to customers</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" v-model="popupSettings.popupEnabled" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <!-- Display Settings -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">📊 Display Settings</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Number of Products to Show</label>
              <select 
                v-model="popupSettings.maxRecommendations"
                class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option :value="1">1 Product</option>
                <option :value="2">2 Products</option>
                <option :value="3">3 Products (Recommended)</option>
                <option :value="4">4 Products</option>
                <option :value="5">5 Products</option>
              </select>
              <p class="text-sm text-gray-500 mt-2">💡 Tip: 3 products is optimal for conversion</p>
            </div>
          </div>
        </div>

        <!-- Timing Settings -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">⏱️ Timing Settings</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Initial Delay (seconds)</label>
              <input 
                type="number" 
                v-model.number="popupSettings.initialDelay"
                min="0"
                max="60"
                class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-sm text-gray-500 mt-2">How long to wait before showing pop-up (0 = instant)</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Cooldown Time (seconds)</label>
              <input 
                type="number" 
                v-model.number="popupSettings.cooldownTime"
                min="0"
                max="3600"
                class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-sm text-gray-500 mt-2">Time to wait after user closes pop-up before showing again</p>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-400 mb-2">Session Limit</label>
              <input 
                type="number" 
                v-model.number="popupSettings.sessionLimit"
                min="1"
                max="10"
                class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p class="text-sm text-gray-500 mt-2">Maximum number of pop-ups to show per user session</p>
            </div>
          </div>
        </div>

        <!-- Trigger Settings -->
        <div>
          <h3 class="text-lg font-semibold text-white mb-4">🎯 Trigger Settings</h3>
          <div class="space-y-4">
            <!-- Exit Intent -->
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-white font-medium">Exit Intent Trigger</p>
                <p class="text-sm text-gray-400">Show pop-up when user moves mouse to leave page</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer ml-4">
                <input type="checkbox" v-model="popupSettings.exitIntentEnabled" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Scroll Trigger -->
            <div>
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <p class="text-white font-medium">Scroll Trigger</p>
                  <p class="text-sm text-gray-400">Show pop-up when user scrolls to certain percentage</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" v-model="popupSettings.scrollTriggerEnabled" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div v-if="popupSettings.scrollTriggerEnabled" class="ml-0">
                <label class="block text-sm font-medium text-gray-400 mb-2">Scroll Percentage (%)</label>
                <input 
                  type="number" 
                  v-model.number="popupSettings.scrollTriggerPercent"
                  min="0"
                  max="100"
                  class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="text-sm text-gray-500 mt-2">0 = instant, 50 = halfway, 100 = bottom</p>
              </div>
            </div>

            <!-- Post-Cart Trigger -->
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <p class="text-white font-medium">Post-Cart Trigger</p>
                <p class="text-sm text-gray-400">Show pop-up after user adds product to cart</p>
              </div>
              <label class="relative inline-flex items-center cursor-pointer ml-4">
                <input type="checkbox" v-model="popupSettings.postCartEnabled" class="sr-only peer">
                <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <!-- Time Trigger -->
            <div>
              <div class="flex items-start justify-between mb-2">
                <div class="flex-1">
                  <p class="text-white font-medium">Time Trigger (Fallback)</p>
                  <p class="text-sm text-gray-400">Show pop-up after user spends time on page</p>
                </div>
                <label class="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" v-model="popupSettings.timeTriggerEnabled" class="sr-only peer">
                  <div class="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              <div v-if="popupSettings.timeTriggerEnabled" class="ml-0">
                <label class="block text-sm font-medium text-gray-400 mb-2">Time Delay (seconds)</label>
                <input 
                  type="number" 
                  v-model.number="popupSettings.timeTriggerDelay"
                  min="1"
                  max="300"
                  class="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p class="text-sm text-gray-500 mt-2">Fallback trigger if no other trigger activates</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Info Box -->
        <div class="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4">
          <p class="text-sm text-blue-300">
            💡 <strong>Tip:</strong> Enable multiple triggers for best results. Pop-up will show when the FIRST trigger condition is met.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
