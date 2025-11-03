<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const authStore = useAuthStore();
const currentPlan = ref('free');
const loading = ref(true);

// Plan data
const plans = [
  {
    id: 'free',
    name: 'FREE',
    price: 0,
    period: '/month',
    description: 'Perfect for testing',
    features: [
      '5 landing pages/month',
      '30 pop-ups/month',
      '30 products maximum',
      'Full analytics',
      'AI auto-detect language',
      'Community support',
      'No watermark'
    ],
    highlighted: false,
    badge: null
  },
  {
    id: 'starter',
    name: 'STARTER',
    price: 29,
    period: '/month',
    description: 'For small businesses',
    features: [
      '40 landing pages/month',
      '500 pop-ups/month',
      '100 products maximum',
      'Full analytics',
      'AI auto-detect language',
      'Email support',
      'No watermark'
    ],
    highlighted: false,
    badge: null
  },
  {
    id: 'professional',
    name: 'PROFESSIONAL',
    price: 79,
    period: '/month',
    description: 'For growing stores',
    features: [
      '100 landing pages/month',
      '2,000 pop-ups/month',
      '500 products maximum',
      'Full analytics',
      'AI auto-detect language',
      'Priority support',
      'No watermark'
    ],
    highlighted: true,
    badge: 'MOST POPULAR'
  },
  {
    id: 'agency',
    name: 'AGENCY',
    price: 199,
    period: '/month',
    description: 'For agencies & enterprises',
    features: [
      '500 landing pages/month',
      'Unlimited pop-ups',
      'Unlimited products',
      '5 stores',
      'AI auto-detect language',
      'White-label option',
      'Dedicated support'
    ],
    highlighted: false,
    badge: null
  }
];

onMounted(async () => {
  try {
    if (authStore.userId) {
      const storeDoc = await getDoc(doc(db, 'stores', authStore.userId));
      if (storeDoc.exists()) {
        currentPlan.value = storeDoc.data().plan || 'free';
      }
    }
  } catch (error) {
    console.error('Failed to load plan:', error);
  } finally {
    loading.value = false;
  }
});

function isCurrentPlan(planId: string) {
  return currentPlan.value === planId;
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center">
      <h1 class="text-4xl font-bold text-white mb-4">Choose Your Plan</h1>
      <p class="text-lg text-gray-400 max-w-2xl mx-auto">
        Start with our FREE plan and upgrade as you grow. All plans include AI-powered content generation and WordPress integration.
      </p>
    </div>

    <!-- Pricing Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="relative bg-[#0f1535] rounded-xl border transition-all duration-300"
        :class="[
          plan.highlighted 
            ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105' 
            : 'border-gray-800 hover:border-gray-700',
          isCurrentPlan(plan.id) ? 'ring-2 ring-green-500' : ''
        ]"
      >
        <!-- Badge -->
        <div v-if="plan.badge" class="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span class="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            {{ plan.badge }}
          </span>
        </div>

        <!-- Current Plan Badge -->
        <div v-if="isCurrentPlan(plan.id)" class="absolute -top-3 right-4">
          <span class="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            CURRENT PLAN
          </span>
        </div>

        <div class="p-6">
          <!-- Plan Name -->
          <h3 class="text-xl font-bold text-white mb-2">{{ plan.name }}</h3>
          <p class="text-sm text-gray-400 mb-6">{{ plan.description }}</p>

          <!-- Price -->
          <div class="mb-6">
            <div class="flex items-baseline">
              <span class="text-4xl font-bold text-white">€{{ plan.price }}</span>
              <span class="text-gray-400 ml-2">{{ plan.period }}</span>
            </div>
          </div>

          <!-- Features -->
          <ul class="space-y-3 mb-8">
            <li
              v-for="(feature, index) in plan.features"
              :key="index"
              class="flex items-start gap-2 text-sm"
            >
              <svg class="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <span class="text-gray-300">{{ feature }}</span>
            </li>
          </ul>

          <!-- CTA Button -->
          <button
            v-if="isCurrentPlan(plan.id)"
            disabled
            class="w-full bg-green-600/20 text-green-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed border border-green-600/30"
          >
            Current Plan
          </button>
          <button
            v-else-if="plan.id === 'free'"
            disabled
            class="w-full bg-gray-700 text-gray-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed opacity-50"
          >
            Free Forever
          </button>
          <button
            v-else
            disabled
            class="w-full bg-blue-600/20 text-blue-400 py-3 px-4 rounded-lg font-medium cursor-not-allowed border border-blue-600/30 hover:bg-blue-600/30 transition-colors"
          >
            Coming Soon
          </button>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="max-w-3xl mx-auto mt-16">
      <h2 class="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
      
      <div class="space-y-4">
        <!-- FAQ 1 -->
        <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-white mb-2">Can I change plans later?</h3>
          <p class="text-gray-400">Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
        </div>

        <!-- FAQ 2 -->
        <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-white mb-2">What happens when I reach my page limit?</h3>
          <p class="text-gray-400">You'll be notified when you're close to your limit. You can upgrade to generate more pages or wait until next month when your limit resets.</p>
        </div>

        <!-- FAQ 3 -->
        <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-white mb-2">Do pages reset every month?</h3>
          <p class="text-gray-400">Yes, your page generation limit resets on the 1st of each month. Unused pages don't roll over.</p>
        </div>

        <!-- FAQ 4 -->
        <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-6">
          <h3 class="text-lg font-semibold text-white mb-2">Is there a free trial?</h3>
          <p class="text-gray-400">Our FREE plan is available forever with 5 pages/month. No credit card required. Upgrade anytime when you need more capacity.</p>
        </div>
      </div>
    </div>

    <!-- CTA Section -->
    <div class="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl border border-blue-500/30 p-8 text-center">
      <h2 class="text-3xl font-bold text-white mb-4">Ready to scale your content?</h2>
      <p class="text-lg text-gray-300 mb-6">
        Join hundreds of stores using AI to generate high-converting landing pages.
      </p>
      <button
        disabled
        class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors opacity-50 cursor-not-allowed"
      >
        Stripe Integration Coming Soon
      </button>
    </div>
  </div>
</template>
