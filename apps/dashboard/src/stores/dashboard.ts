import { defineStore } from 'pinia';
import { ref } from 'vue';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuthStore } from './auth';

export const useDashboardStore = defineStore('dashboard', () => {
  const authStore = useAuthStore();
  
  const stores = ref<any[]>([]);
  const analytics = ref<any>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fetch user's stores
  async function fetchStores() {
    if (!authStore.userId) {
      console.log('❌ No userId - cannot fetch stores');
      return;
    }

    console.log('🔍 Fetching stores for userId:', authStore.userId);
    loading.value = true;
    error.value = null;

    try {
      const storesQuery = query(
        collection(db, 'stores'),
        where('userId', '==', authStore.userId)
      );

      const snapshot = await getDocs(storesQuery);
      console.log('📊 Found stores:', snapshot.docs.length);
      
      stores.value = snapshot.docs.map(doc => {
        console.log('📦 Store:', doc.id, doc.data());
        return {
          id: doc.id,
          ...doc.data()
        };
      });
    } catch (err: any) {
      error.value = err.message;
      console.error('❌ Error fetching stores:', err);
    } finally {
      loading.value = false;
    }
  }

  // Fetch analytics for all user's stores
  async function fetchAnalytics() {
    if (!authStore.userId || stores.value.length === 0) return;

    loading.value = true;
    error.value = null;

    try {
      const storeIds = stores.value.map(store => store.storeId);
      
      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Fetch analytics for all stores
      const analyticsQuery = query(
        collection(db, 'analytics_daily'),
        where('storeId', 'in', storeIds),
        where('date', '==', today)
      );

      const snapshot = await getDocs(analyticsQuery);
      
      // Aggregate analytics
      let totalRevenue = 0;
      let upsellRevenue = 0;
      let conversions = 0;
      let impressions = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        totalRevenue += data.totalRevenue || 0;
        upsellRevenue += data.upsellRevenue || 0;
        conversions += data.conversions || 0;
        impressions += data.impressions || 0;
      });

      analytics.value = {
        totalRevenue,
        upsellRevenue,
        conversions,
        impressions,
        conversionRate: impressions > 0 ? (conversions / impressions) * 100 : 0,
        avgOrderValue: conversions > 0 ? totalRevenue / conversions : 0,
      };
    } catch (err: any) {
      error.value = err.message;
      console.error('Error fetching analytics:', err);
    } finally {
      loading.value = false;
    }
  }

  // Real-time listener for stores
  function subscribeToStores() {
    if (!authStore.userId) return;

    const storesQuery = query(
      collection(db, 'stores'),
      where('userId', '==', authStore.userId)
    );

    return onSnapshot(storesQuery, (snapshot) => {
      stores.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    });
  }

  // Initialize dashboard data
  async function initDashboard() {
    await fetchStores();
    await fetchAnalytics();
  }

  return {
    stores,
    analytics,
    loading,
    error,
    fetchStores,
    fetchAnalytics,
    subscribeToStores,
    initDashboard,
  };
});
