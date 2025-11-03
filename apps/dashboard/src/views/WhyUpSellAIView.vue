<script setup lang="ts">
import { ref } from 'vue';

const features = ref([
  {
    icon: '🎯',
    title: 'AI Semantic Recommendations',
    description: 'Our advanced AI analyzes your products and suggests the perfect matches to maximize conversions. Intelligent, contextual, and highly effective.',
    benefits: [
      'Increase sales by 25-40%',
      'Context-aware product matching',
      'Understands product catalog deeply',
      'Truly complementary recommendations'
    ]
  },
  {
    icon: '🎨',
    title: 'AI Landing Pages',
    description: 'Generate high-converting landing pages for every product in minutes. Perfect for ads, SEO, and social media.',
    benefits: [
      '500+ words persuasive content',
      'SEO optimized (Schema.org)',
      'Perfect for Facebook/Google Ads',
      'One-click WordPress publishing'
    ]
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    description: 'Track every impression, click, and conversion. Understand what works and optimize for maximum ROI.',
    benefits: [
      'Conversion tracking',
      'Revenue attribution',
      'Performance insights',
      'A/B testing ready'
    ]
  },
  {
    icon: '⚡',
    title: 'Zero Setup Required',
    description: 'Install plugin, sync products, and you\'re done. AI handles everything automatically.',
    benefits: [
      'Auto industry detection',
      'Auto language detection',
      'Smart product matching',
      'No manual configuration'
    ]
  }
]);

const stats = ref([
  { value: '25-40%', label: 'Sales Increase' },
  { value: '3-5X', label: 'Better Conversion' },
  { value: '< 5 min', label: 'Setup Time' },
  { value: '100%', label: 'Automated' }
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
        Why UpSell AI?
      </h1>
      <p class="text-xl text-gray-400">
        The only WooCommerce solution that combines AI semantic recommendations with dedicated landing pages for maximum conversions
      </p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div 
        v-for="stat in stats" 
        :key="stat.label"
        class="bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-6 text-center transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
      >
        <div class="text-3xl font-bold text-white mb-2">{{ stat.value }}</div>
        <div class="text-sm text-gray-400">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="bg-[#0f1535] rounded-xl border border-gray-800 p-6 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-500/50 group"
      >
        <!-- Icon & Title -->
        <div class="flex items-start gap-4 mb-4">
          <div class="text-4xl group-hover:scale-110 transition-transform duration-300">
            {{ feature.icon }}
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-semibold text-white mb-2">{{ feature.title }}</h3>
            <p class="text-gray-400 text-sm">{{ feature.description }}</p>
          </div>
        </div>

        <!-- Benefits -->
        <div class="space-y-2 mt-4">
          <div 
            v-for="benefit in feature.benefits" 
            :key="benefit"
            class="flex items-center gap-2 text-sm text-gray-300"
          >
            <span class="text-green-500">✓</span>
            <span>{{ benefit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Competitive Advantage -->
    <div class="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-8">
      <h2 class="text-2xl font-bold text-white mb-6 text-center">
        🏆 What Makes Us Unique
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-3xl mb-3">🎯</div>
          <h3 class="text-lg font-semibold text-white mb-2">AI Semantic Intelligence</h3>
          <p class="text-sm text-gray-400">UpSell AI understands your product catalog and recommends items that truly complement each other. No manual setup required - our AI does the heavy lifting.</p>
        </div>
        
        <div class="text-center">
          <div class="text-3xl mb-3">🎨</div>
          <h3 class="text-lg font-semibold text-white mb-2">High-Converting Landing Pages</h3>
          <p class="text-sm text-gray-400">Dedicated pages per product with persuasive content - perfect for ads, SEO, and social media sharing</p>
        </div>
        
        <div class="text-center">
          <div class="text-3xl mb-3">⚡</div>
          <h3 class="text-lg font-semibold text-white mb-2">Advanced AI Algorithms</h3>
          <p class="text-sm text-gray-400">We use cutting-edge AI to analyze product attributes, categories, pricing, and customer behavior patterns to generate highly relevant recommendations</p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-center">
      <h2 class="text-2xl font-bold text-white mb-4">
        Ready to Increase Your Sales?
      </h2>
      <p class="text-white/90 mb-6">
        Join hundreds of stores using UpSell AI to boost conversions
      </p>
      <RouterLink
        to="/pricing"
        class="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition transform hover:scale-105"
      >
        View Pricing Plans
      </RouterLink>
    </div>
  </div>
</template>
