import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const router = useRouter();

  // Computed
  const isAuthenticated = computed(() => !!user.value);
  const userEmail = computed(() => user.value?.email || '');
  const userId = computed(() => user.value?.uid || '');

  // Initialize auth state listener
  function initAuth() {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser;
      loading.value = false;

      if (firebaseUser) {
        // Check if user profile exists in Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (!userDoc.exists()) {
          // Create user profile
          await createUserProfile(firebaseUser);
        }
      }
    });
  }

  // Register
  async function register(email: string, password: string, name: string) {
    try {
      loading.value = true;
      error.value = null;

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await createUserProfile(userCredential.user, name);

      router.push('/');
      return { success: true };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Login
  async function login(email: string, password: string) {
    try {
      loading.value = true;
      error.value = null;

      await signInWithEmailAndPassword(auth, email, password);
      
      router.push('/');
      return { success: true };
    } catch (err: any) {
      error.value = err.message;
      return { success: false, error: err.message };
    } finally {
      loading.value = false;
    }
  }

  // Logout
  async function logout() {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err: any) {
      error.value = err.message;
    }
  }

  // Create user profile in Firestore
  async function createUserProfile(firebaseUser: User, name?: string) {
    const userProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: name || firebaseUser.email?.split('@')[0] || 'User',
      apiKey: generateApiKey(),
      plan: 'trial',
      createdAt: new Date(),
      stores: [],
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);
  }

  // Generate API Key
  function generateApiKey(): string {
    const prefix = 'sk_live_';
    const randomString = Array.from({ length: 32 }, () => 
      Math.random().toString(36).charAt(2)
    ).join('');
    return prefix + randomString;
  }

  // Get user profile
  async function getUserProfile() {
    if (!user.value) return null;
    
    const userDoc = await getDoc(doc(db, 'users', user.value.uid));
    return userDoc.exists() ? userDoc.data() : null;
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    userEmail,
    userId,
    initAuth,
    register,
    login,
    logout,
    getUserProfile,
  };
});
