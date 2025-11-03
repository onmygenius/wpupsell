<script setup lang="ts">
import { ref } from 'vue';

const steps = ref([
  {
    number: '1',
    title: 'Install Plugin',
    description: 'Download and install the UpSell AI plugin on your WooCommerce store. Takes less than 2 minutes.',
    icon: '📦',
    details: [
      'Download plugin ZIP',
      'Upload to WordPress',
      'Activate plugin',
      'Enter API Key'
    ]
  },
  {
    number: '2',
    title: 'Sync Products',
    description: 'Click "Sync Products" and our AI will analyze your entire catalog automatically.',
    icon: '🔄',
    details: [
      'Auto-detect industry',
      'Auto-detect language',
      'Analyze product attributes',
      'Build recommendation engine'
    ]
  },
  {
    number: '3',
    title: 'AI Works Magic',
    description: 'Our AI generates recommendations and landing pages for every product. No manual work required.',
    icon: '🤖',
    details: [
      'Semantic product matching',
      'Generate landing pages',
      'Create unique messages',
      'Optimize for conversions'
    ]
  },
  {
    number: '4',
    title: 'Watch Sales Grow',
    description: 'Pop-ups appear automatically. Landing pages are ready for ads. Track everything in real-time.',
    icon: '📈',
    details: [
      'Smart pop-up triggers',
      'High-converting landing pages',
      'Real-time analytics',
      'Automatic optimization'
    ]
  }
]);

const features = ref([
  {
    title: 'For Pop-up Recommendations',
    icon: '🎯',
    steps: [
      'Customer views product page',
      'AI analyzes product context',
      'Smart trigger activates (scroll, exit, time)',
      'Pop-up shows 3 perfect matches',
      'Customer adds to cart → Conversion! 🎉'
    ]
  },
  {
    title: 'For Landing Pages',
    icon: '🎨',
    steps: [
      'Generate landing page per product',
      'AI writes 500+ words persuasive content',
      'Optimize for SEO (Schema.org, Meta tags)',
      'Use in Facebook/Google Ads',
      'Share on social media → More sales! 🚀'
    ]
  }
]);
</script>

<template>
  <div class="space-y-8">
    <!-- Header with Logo -->
    <div class="text-center max-w-3xl mx-auto">
      <div class="flex justify-center mb-6">
        <img src="/logo.gif" alt="UpSell AI" class="w-24 h-24 rounded-2xl shadow-2xl shadow-blue-500/50" />
      </div>
      <h1 class="text-4xl font-bold text-white mb-4">
        How It Works
      </h1>
      <p class="text-xl text-gray-400">
        Get started in less than 5 minutes. No coding, no complex setup, no manual work.
      </p>
    </div>

    <!-- Steps -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="step in steps"
        :key="step.number"
        class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/50 group relative"
      >
        <!-- Step Number -->
        <div class="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg group-hover:scale-110 transition-transform">
          {{ step.number }}
        </div>

        <!-- Icon -->
        <div class="text-5xl mb-4 text-center group-hover:scale-110 transition-transform duration-300">
          {{ step.icon }}
        </div>

        <!-- Title & Description -->
        <h3 class="text-xl font-semibold text-white mb-3 text-center">{{ step.title }}</h3>
        <p class="text-gray-400 text-sm mb-4 text-center">{{ step.description }}</p>

        <!-- Details -->
        <div class="space-y-2">
          <div 
            v-for="detail in step.details" 
            :key="detail"
            class="flex items-center gap-2 text-xs text-gray-300"
          >
            <span class="text-blue-500">→</span>
            <span>{{ detail }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Flow -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
      >
        <div class="flex items-center gap-3 mb-6">
          <div class="text-3xl">{{ feature.icon }}</div>
          <h3 class="text-xl font-semibold text-white">{{ feature.title }}</h3>
        </div>

        <div class="space-y-3">
          <div 
            v-for="(step, index) in feature.steps" 
            :key="index"
            class="flex items-start gap-3"
          >
            <div class="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
              {{ index + 1 }}
            </div>
            <p class="text-gray-300 text-sm">{{ step }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Technical Details -->
    <div class="bg-[#0f1535] rounded-xl border border-gray-800 p-8">
      <h2 class="text-2xl font-bold text-white mb-6 text-center">
        🔧 Technical Details
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-3xl mb-3">🤖</div>
          <h3 class="text-lg font-semibold text-white mb-2">Advanced AI Algorithms</h3>
          <p class="text-sm text-gray-400">We use cutting-edge AI to analyze product attributes, categories, pricing, and customer behavior patterns</p>
        </div>
        
        <div class="text-center">
          <div class="text-3xl mb-3">⚡</div>
          <h3 class="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
          <p class="text-sm text-gray-400">Recommendations generated in real-time - your customers never wait</p>
        </div>
        
        <div class="text-center">
          <div class="text-3xl mb-3">🔒</div>
          <h3 class="text-lg font-semibold text-white mb-2">Secure & Private</h3>
          <p class="text-sm text-gray-400">Your data is encrypted and secure - we take privacy seriously</p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center">
      <h2 class="text-2xl font-bold text-white mb-4">
        Ready to Get Started?
      </h2>
      <p class="text-white/90 mb-6">
        Install the plugin and see results in less than 5 minutes
      </p>
      <div class="flex gap-4 justify-center">
        <RouterLink
          to="/stores"
          class="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
        >
          Get Started Free
        </RouterLink>
        <RouterLink
          to="/pricing"
          class="inline-block bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition transform hover:scale-105"
        >
          View Pricing
        </RouterLink>
      </div>
    </div>
  </div>
</template>
