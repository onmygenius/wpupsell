import * as admin from 'firebase-admin';

let initialized = false;

function initializeFirebase() {
  if (initialized) return;
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  
  initialized = true;
}

// Lazy getters
export const getDb = () => {
  initializeFirebase();
  return admin.firestore();
};

export const getAuth = () => {
  initializeFirebase();
  return admin.auth();
};

// Backward compatibility
export const db = new Proxy({} as any, {
  get(target: any, prop: string | symbol) {
    return (getDb() as any)[prop];
  }
});

export const auth = new Proxy({} as any, {
  get(target: any, prop: string | symbol) {
    return (getAuth() as any)[prop];
  }
});

export default admin;
