# SETUP VERCEL + FIREBASE - WOOCOMMERCE SAAS

## 🎯 OVERVIEW

Stack complet serverless pentru dezvoltare rapidă și scalare automată.

---

## 📁 STRUCTURĂ REPO (Monorepo)

```
woocommerce-saas/
├── apps/
│   ├── api/                          # Vercel Serverless API
│   │   ├── api/
│   │   │   ├── recommendations.ts    # POST /api/recommendations
│   │   │   ├── conversion.ts         # POST /api/conversion
│   │   │   ├── analytics.ts          # GET /api/analytics
│   │   │   ├── stores.ts             # CRUD stores
│   │   │   └── auth.ts               # API key validation
│   │   ├── lib/
│   │   │   ├── firebase-admin.ts     # Firebase Admin SDK
│   │   │   ├── groq.ts               # Groq AI client
│   │   │   ├── cache.ts              # Edge Config caching
│   │   │   ├── ai-engine.ts          # Recommendation engine
│   │   │   └── middleware.ts         # Auth, rate limiting
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vercel.json               # Vercel config
│   │
│   ├── dashboard/                    # Vue 3 Dashboard
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── layout/
│   │   │   │   ├── analytics/
│   │   │   │   └── settings/
│   │   │   ├── views/
│   │   │   │   ├── Dashboard.vue
│   │   │   │   ├── Analytics.vue
│   │   │   │   ├── Settings.vue
│   │   │   │   └── Billing.vue
│   │   │   ├── stores/               # Pinia stores
│   │   │   │   ├── auth.ts
│   │   │   │   ├── stores.ts
│   │   │   │   └── analytics.ts
│   │   │   ├── router/
│   │   │   │   └── index.ts
│   │   │   ├── composables/
│   │   │   │   ├── useFirebase.ts
│   │   │   │   └── useAnalytics.ts
│   │   │   ├── firebase/
│   │   │   │   └── config.ts         # Firebase client SDK
│   │   │   ├── App.vue
│   │   │   └── main.ts
│   │   ├── public/
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── tailwind.config.js
│   │   └── vercel.json
│   │
│   └── plugin/                       # WooCommerce Plugin
│       ├── wooboost-ai.php           # Main plugin file
│       ├── includes/
│       │   ├── class-api-client.php
│       │   ├── class-recommendations.php
│       │   ├── class-tracking.php
│       │   └── class-settings.php
│       ├── assets/
│       │   ├── js/
│       │   │   ├── recommendations.js  # Alpine.js UI
│       │   │   └── tracking.js
│       │   └── css/
│       │       └── styles.css
│       ├── templates/
│       │   └── popup.php
│       └── readme.txt
│
├── packages/
│   └── shared/                       # Shared TypeScript types
│       ├── src/
│       │   ├── types/
│       │   │   ├── store.ts
│       │   │   ├── product.ts
│       │   │   ├── recommendation.ts
│       │   │   └── analytics.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
│
├── firebase/
│   ├── firestore.rules               # Security rules
│   ├── firestore.indexes.json        # Composite indexes
│   ├── storage.rules                 # Storage security
│   └── firebase.json                 # Firebase config
│
├── .github/
│   └── workflows/
│       ├── deploy-api.yml            # Auto-deploy API
│       └── deploy-dashboard.yml      # Auto-deploy Dashboard
│
├── package.json                      # Root package.json
├── pnpm-workspace.yaml               # pnpm workspaces
├── turbo.json                        # Turborepo config
├── .env.example
└── README.md
```

---

## 🔥 FIREBASE SETUP

### **1. Firestore Collections**

```typescript
// stores collection
interface Store {
  id: string                          // Auto-generated
  name: string
  url: string
  apiKey: string                      // Generated unique key
  plan: 'starter' | 'growth' | 'pro'
  status: 'trial' | 'active' | 'cancelled'
  userId: string                      // Firebase Auth UID
  createdAt: Timestamp
  trialEndsAt?: Timestamp
  settings: {
    displayType: 'popup' | 'banner' | 'inline'
    enableUpsell: boolean
    enableCrossSell: boolean
    locations: ('product' | 'cart' | 'checkout')[]
    discountPercent: number
  }
}

// products collection
interface Product {
  id: string                          // WooCommerce product ID
  storeId: string
  name: string
  price: number
  category: string
  sku: string
  stock: number
  imageUrl?: string
  tags: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

// orders collection
interface Order {
  id: string                          // WooCommerce order ID
  storeId: string
  total: number
  items: Array<{
    productId: string
    quantity: number
    price: number
  }>
  customerId?: string
  createdAt: Timestamp
}

// recommendations collection
interface Recommendation {
  id: string
  storeId: string
  productId: string
  recommendedProducts: Array<{
    productId: string
    probability: number
    reason: string
    score: number
  }>
  algorithm: 'collaborative' | 'ai' | 'hybrid'
  createdAt: Timestamp
  expiresAt: Timestamp
  cacheHit: boolean
}

// conversions collection
interface Conversion {
  id: string
  storeId: string
  recId: string
  productId: string
  converted: boolean
  revenue: number
  displayLocation: 'product' | 'cart' | 'checkout'
  deviceType: 'desktop' | 'mobile' | 'tablet'
  createdAt: Timestamp
}

// analytics_daily collection (aggregated)
interface AnalyticsDaily {
  id: string
  storeId: string
  date: string                        // YYYY-MM-DD
  totalRevenue: number
  upsellRevenue: number
  conversions: number
  impressions: number
  conversionRate: number
  avgOrderValue: number
  topProducts: Array<{
    productId: string
    revenue: number
    conversions: number
  }>
}

// users collection (Firebase Auth linked)
interface User {
  id: string                          // Firebase Auth UID
  email: string
  displayName: string
  photoURL?: string
  stores: string[]                    // Array of store IDs
  subscription: {
    plan: 'starter' | 'growth' | 'pro'
    status: 'trial' | 'active' | 'cancelled'
    stripeCustomerId?: string
    currentPeriodEnd?: Timestamp
  }
  createdAt: Timestamp
}
```

### **2. Firestore Security Rules**

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function hasValidApiKey(storeId) {
      let store = get(/databases/$(database)/documents/stores/$(storeId));
      return request.auth.token.apiKey == store.data.apiKey;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Stores collection
    match /stores/{storeId} {
      allow read: if isAuthenticated() && 
                     resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update, delete: if isAuthenticated() && 
                               resource.data.userId == request.auth.uid;
    }
    
    // Products collection (API key auth)
    match /products/{productId} {
      allow read, write: if hasValidApiKey(resource.data.storeId);
    }
    
    // Orders collection (API key auth)
    match /orders/{orderId} {
      allow read, write: if hasValidApiKey(resource.data.storeId);
    }
    
    // Recommendations collection
    match /recommendations/{recId} {
      allow read: if hasValidApiKey(resource.data.storeId);
      allow write: if hasValidApiKey(resource.data.storeId);
    }
    
    // Conversions collection
    match /conversions/{convId} {
      allow read, write: if hasValidApiKey(resource.data.storeId);
    }
    
    // Analytics collection
    match /analytics_daily/{docId} {
      allow read: if isAuthenticated() && 
                     resource.data.storeId in get(/databases/$(database)/documents/users/$(request.auth.uid)).data.stores;
      allow write: if false; // Only via Cloud Functions
    }
  }
}
```

### **3. Firestore Indexes**

```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "storeId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "orders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "storeId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "conversions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "storeId", "order": "ASCENDING" },
        { "fieldPath": "converted", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "recommendations",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "storeId", "order": "ASCENDING" },
        { "fieldPath": "productId", "order": "ASCENDING" },
        { "fieldPath": "expiresAt", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## ⚡ VERCEL SETUP

### **1. API Routes Structure**

```typescript
// apps/api/api/recommendations.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { validateApiKey } from '../lib/middleware';
import { getRecommendations } from '../lib/ai-engine';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate API key
    const storeId = await validateApiKey(req);
    if (!storeId) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const { product_id, cart_value } = req.body;

    // Get recommendations
    const recommendations = await getRecommendations({
      storeId,
      productId: product_id,
      cartValue: cart_value
    });

    res.status(200).json(recommendations);
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### **2. Vercel Configuration**

```json
// apps/api/vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "env": {
    "FIREBASE_PROJECT_ID": "@firebase-project-id",
    "GROQ_API_KEY": "@groq-api-key"
  },
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

```json
// apps/dashboard/vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

---

## 🚀 DEPLOYMENT WORKFLOW

### **1. Environment Variables**

```bash
# .env.example

# Firebase
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Groq AI
GROQ_API_KEY=your-groq-api-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Vercel Edge Config
EDGE_CONFIG=https://edge-config.vercel.com/...
```

### **2. GitHub Actions**

```yaml
# .github/workflows/deploy-api.yml
name: Deploy API to Vercel

on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_API_PROJECT_ID }}
          working-directory: ./apps/api
          vercel-args: '--prod'
```

---

## 💰 COSTURI ESTIMATE

### **Vercel:**
- **Hobby (Free):** 100GB bandwidth, serverless functions
- **Pro ($20/lună):** 1TB bandwidth, advanced analytics, edge config
- **Recomandat:** Pro pentru production

### **Firebase:**
- **Spark (Free):** 50K reads/zi, 20K writes/zi
- **Blaze (Pay-as-you-go):**
  - Reads: $0.06 per 100K
  - Writes: $0.18 per 100K
  - Storage: $0.026/GB
  - **Estimat 200 clienți:** $50-80/lună

### **Total Infrastructure:**
- Vercel Pro: $20/lună
- Firebase: $50-80/lună
- **TOTAL: $70-100/lună** (fără AI și Stripe)

---

## 🎯 NEXT STEPS

1. **Setup Firebase Project**
   - Creează project în Firebase Console
   - Enable Firestore, Auth, Storage
   - Download service account key

2. **Setup Vercel Projects**
   - Creează 2 projects: API + Dashboard
   - Link cu GitHub repo
   - Configure environment variables

3. **Local Development**
   - Install Firebase Emulator Suite
   - Setup Vercel CLI pentru local testing
   - Configure hot reload

4. **Deploy MVP**
   - Push to main branch
   - Auto-deploy via GitHub Actions
   - Test endpoints

---

**Creat:** 31 Octombrie 2025
**Status:** Technical Setup Guide
**Stack:** Vercel + Firebase + Vue 3 + TypeScript
