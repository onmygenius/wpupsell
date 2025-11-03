<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from './components/layout/AppLayout.vue';

const route = useRoute();

// Hide layout for auth pages
const isAuthPage = computed(() => {
  return ['login', 'register', 'forgot-password'].includes(route.name as string);
});
</script>

<template>
  <AppLayout v-if="!isAuthPage" />
  <RouterView v-else />
</template>
