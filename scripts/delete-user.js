// Delete user and store from Firebase
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
const serviceAccount = require('../api/lib/firebase-service-account.json');

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

async function deleteUser(email) {
  try {
    console.log('🔍 Searching for user:', email);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    const userId = userRecord.uid;
    
    console.log('✅ User found:', userId);
    
    // Delete store from Firestore
    console.log('🗑️ Deleting store from Firestore...');
    const storeRef = db.collection('stores').doc(userId);
    const storeDoc = await storeRef.get();
    
    if (storeDoc.exists()) {
      // Delete products subcollection
      const productsSnapshot = await storeRef.collection('products').get();
      console.log(`🗑️ Deleting ${productsSnapshot.size} products...`);
      
      const batch = db.batch();
      productsSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('✅ Products deleted');
      
      // Delete store document
      await storeRef.delete();
      console.log('✅ Store deleted from Firestore');
    } else {
      console.log('⚠️ No store found in Firestore');
    }
    
    // Delete user from Auth
    console.log('🗑️ Deleting user from Firebase Auth...');
    await auth.deleteUser(userId);
    console.log('✅ User deleted from Firebase Auth');
    
    console.log('\n✅✅✅ ALL DATA DELETED SUCCESSFULLY! ✅✅✅\n');
    console.log('You can now test with a fresh install!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Get email from command line
const email = process.argv[2] || 'laba@aol.com';

console.log('🚀 Starting deletion process...\n');
deleteUser(email).then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
});
