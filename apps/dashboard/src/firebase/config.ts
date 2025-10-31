import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyA3oMOEzy5EHcSnhW-UbmZw3zPOXZsLamQ",
  authDomain: "wpupsell.firebaseapp.com",
  projectId: "wpupsell",
  storageBucket: "wpupsell.firebasestorage.app",
  messagingSenderId: "1021347771173",
  appId: "1:1021347771173:web:47048c13a99eb94737e0cc",
  measurementId: "G-RV09TF2CKM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
