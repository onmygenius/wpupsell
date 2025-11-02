const { getDb } = require('./firebase-admin');

/**
 * Check if user can perform an action based on their plan limits
 * @param {string} userId - User ID
 * @param {string} action - Action to check: 'generate_page' or 'sync_products'
 * @param {number} requestedAmount - Amount requested (e.g., number of pages to generate)
 * @returns {Promise<{allowed: boolean, message?: string, current?: number, limit?: number, upgradeMessage?: string}>}
 */
async function checkPlanLimits(userId, action, requestedAmount = 1) {
  const db = getDb();
  const storeDoc = await db.collection('stores').doc(userId).get();
  
  if (!storeDoc.exists) {
    return { 
      allowed: false, 
      message: 'Store not found' 
    };
  }
  
  const store = storeDoc.data();
  const { plan = 'free', limits, usage } = store;
  
  // Check if limits exist (for old stores without plan structure)
  if (!limits || !usage) {
    console.warn(`⚠️ Store ${userId} missing limits/usage - allowing action`);
    return { allowed: true };
  }
  
  // Auto-reset if needed (new month)
  await checkAndResetUsage(userId, usage);
  
  // Refresh usage after potential reset
  const updatedDoc = await db.collection('stores').doc(userId).get();
  const currentUsage = updatedDoc.data().usage;
  
  // Check specific action
  if (action === 'generate_page') {
    const availablePages = limits.pagesPerMonth - currentUsage.pagesGenerated;
    
    if (requestedAmount > availablePages) {
      return {
        allowed: false,
        message: `You have ${availablePages} pages remaining. You requested ${requestedAmount}.`,
        current: currentUsage.pagesGenerated,
        limit: limits.pagesPerMonth,
        upgradeMessage: getUpgradeMessage(plan),
        upgradePlan: getNextPlan(plan)
      };
    }
  }
  
  if (action === 'sync_products') {
    // Count products in subcollection
    const productsSnapshot = await db.collection('stores').doc(userId)
      .collection('products').get();
    const productCount = productsSnapshot.size;
    
    if (productCount > limits.maxProducts) {
      return {
        allowed: false,
        message: `You have ${productCount} products, but ${plan.toUpperCase()} plan allows max ${limits.maxProducts}.`,
        current: productCount,
        limit: limits.maxProducts,
        upgradeMessage: getUpgradeMessage(plan),
        upgradePlan: getNextPlan(plan)
      };
    }
  }
  
  return { allowed: true };
}

/**
 * Check if usage needs to be reset (30 days passed)
 * @param {string} userId - User ID
 * @param {object} usage - Current usage object
 */
async function checkAndResetUsage(userId, usage) {
  const now = new Date();
  const lastReset = usage.lastResetDate?.toDate ? usage.lastResetDate.toDate() : new Date(usage.lastResetDate);
  const daysSinceReset = (now - lastReset) / (1000 * 60 * 60 * 24);
  
  if (daysSinceReset >= 30) {
    const db = getDb();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    await db.collection('stores').doc(userId).update({
      'usage.pagesGenerated': 0,
      'usage.lastResetDate': now,
      'usage.currentPeriodStart': now,
      'usage.currentPeriodEnd': periodEnd
    });
    
    console.log(`✅ Reset usage for user ${userId} (${daysSinceReset.toFixed(1)} days since last reset)`);
  }
}

/**
 * Get upgrade message based on current plan
 * @param {string} currentPlan - Current plan name
 * @returns {string} Upgrade message
 */
function getUpgradeMessage(currentPlan) {
  const messages = {
    free: '🎉 Upgrade to STARTER (€29/month) for 40 pages and 30 products!',
    starter: '🔥 Upgrade to PROFESSIONAL (€79/month) for 100 pages and 200 products!',
    professional: '🚀 Upgrade to AGENCY (€199/month) for 500 pages and unlimited products!'
  };
  return messages[currentPlan] || 'Upgrade for more capacity!';
}

/**
 * Get next plan tier
 * @param {string} currentPlan - Current plan name
 * @returns {string} Next plan name
 */
function getNextPlan(currentPlan) {
  const nextPlans = {
    free: 'starter',
    starter: 'professional',
    professional: 'agency'
  };
  return nextPlans[currentPlan] || 'agency';
}

/**
 * Increment usage counter
 * @param {string} userId - User ID
 * @param {string} field - Usage field to increment (e.g., 'pagesGenerated')
 * @param {number} amount - Amount to increment by
 */
async function incrementUsage(userId, field, amount = 1) {
  const db = getDb();
  const admin = require('firebase-admin');
  
  await db.collection('stores').doc(userId).update({
    [`usage.${field}`]: admin.firestore.FieldValue.increment(amount)
  });
  
  console.log(`✅ Incremented usage.${field} by ${amount} for user ${userId}`);
}

/**
 * Get current usage stats
 * @param {string} userId - User ID
 * @returns {Promise<{plan: string, limits: object, usage: object}>}
 */
async function getUsageStats(userId) {
  const db = getDb();
  const storeDoc = await db.collection('stores').doc(userId).get();
  
  if (!storeDoc.exists) {
    return null;
  }
  
  const store = storeDoc.data();
  return {
    plan: store.plan || 'free',
    limits: store.limits || { pagesPerMonth: 5, maxProducts: 10, maxStores: 1 },
    usage: store.usage || { pagesGenerated: 0 }
  };
}

module.exports = { 
  checkPlanLimits, 
  incrementUsage,
  getUsageStats
};
