import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'Dashboard', requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/AnalyticsView.vue'),
      meta: { title: 'Analytics', requiresAuth: true }
    },
    {
      path: '/stores',
      name: 'stores',
      component: () => import('../views/StoresView.vue'),
      meta: { title: 'Stores', requiresAuth: true }
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue'),
      meta: { title: 'Products', requiresAuth: true }
    },
    {
      path: '/landing-pages',
      name: 'landing-pages',
      component: () => import('../views/LandingPagesView.vue'),
      meta: { title: 'Landing Pages', requiresAuth: true }
    },
    {
      path: '/popup-recommendations',
      name: 'popup-recommendations',
      component: () => import('../views/PopupRecommendationsView.vue'),
      meta: { title: 'Pop-up Recommendations', requiresAuth: true }
    },
    {
      path: '/why-upsell-ai',
      name: 'why-upsell-ai',
      component: () => import('../views/WhyUpSellAIView.vue'),
      meta: { title: 'Why UpSell AI' }
    },
    {
      path: '/how-it-works',
      name: 'how-it-works',
      component: () => import('../views/HowItWorksView.vue'),
      meta: { title: 'How It Works' }
    },
    {
      path: '/pricing',
      name: 'pricing',
      component: () => import('../views/PricingView.vue'),
      meta: { title: 'Pricing' }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { title: 'Settings', requiresAuth: true }
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Login', guest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { title: 'Register', guest: true }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue'),
      meta: { title: 'Forgot Password', guest: true }
    }
  ]
});

// Route guards
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const guestOnly = to.matched.some(record => record.meta.guest);

  // Update document title
  document.title = `${to.meta.title} - UpSell AI` || 'UpSell AI Dashboard';

  // Check if route requires authentication
  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  }
  // Check if route is guest only (login/register)
  else if (guestOnly && authStore.isAuthenticated) {
    next('/');
  }
  else {
    next();
  }
});

export default router;
