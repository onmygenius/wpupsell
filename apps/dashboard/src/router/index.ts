import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { title: 'Dashboard' }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: () => import('../views/AnalyticsView.vue'),
      meta: { title: 'Analytics' }
    },
    {
      path: '/stores',
      name: 'stores',
      component: () => import('../views/StoresView.vue'),
      meta: { title: 'Stores' }
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('../views/ProductsView.vue'),
      meta: { title: 'Products' }
    },
    {
      path: '/landing-pages',
      name: 'landing-pages',
      component: () => import('../views/LandingPagesView.vue'),
      meta: { title: 'Landing Pages' }
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
