# ARHITECTURĂ TEHNICĂ - WOOCOMMERCE UPSELL SAAS

## 🏗️ OVERVIEW

**Stack tehnologic pentru SaaS scalabil și performant**

---

## 📐 ARHITECTURĂ HIGH-LEVEL

```
┌─────────────────────────────────────────┐
│  PLUGIN WOOCOMMERCE (pe site client)    │
│  - Colectează date                      │
│  - Trimite la API                       │
│  - Afișează recomandări                 │
└─────────────────┬───────────────────────┘
                  │ HTTPS/REST API
                  ▼
┌─────────────────────────────────────────┐
│  API GATEWAY (server central)           │
│  - Autentificare (API Keys)             │
│  - Rate limiting                        │
│  - Load balancing                       │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  BACKEND SERVICES                       │
│  - Recommendations Engine               │
│  - Analytics Service                    │
│  - Billing Service                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  AI ENGINE                              │
│  - Groq API (rapid + ieftin)            │
│  - Reguli clasice (80%)                 │
│  - Cache Redis (90% hit rate)           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  DATABASE                               │
│  - PostgreSQL (date structurate)        │
│  - Redis (cache + sessions)             │
│  - S3 (backup + logs)                   │
└─────────────────────────────────────────┘
```

---

## 🔧 STACK TEHNOLOGIC ACTUALIZAT

### **Hosting & Infrastructure:**
- ✅ **Vercel** - Backend API (serverless functions) + Dashboard hosting
- ✅ **Firebase** - Firestore (database), Auth, Storage, Functions
- ✅ **Vercel Edge Config** - Caching (înlocuiește Redis)
- ✅ **Groq API** - AI recommendations engine

### **Avantaje:**
- 🚀 Deploy instant (git push → live)
- 💰 Costuri mai mici (Vercel free tier + Firebase pay-as-you-go)
- ⚡ Serverless auto-scaling
- 🔒 Auth built-in (Firebase Auth)
- 📊 Real-time updates (Firestore)

---

## 🔧 COMPONENTE PRINCIPALE

### **1. PLUGIN WOOCOMMERCE (Client-side)**

**Tehnologii:**
- PHP 8.0+
- JavaScript (vanilla + Alpine.js)
- WooCommerce Hooks & Filters

**Funcții:**
```php
// Colectare date la instalare
function wooboost_collect_initial_data() {
    $products = get_all_products();
    $orders = get_orders_last_6_months();
    
    send_to_api([
        'store_id' => get_store_id(),
        'products' => $products,
        'orders' => $orders
    ]);
}

// Afișare recomandări
function wooboost_show_recommendations($product_id) {
    $recommendations = get_recommendations_from_api($product_id);
    
    if ($recommendations) {
        display_popup($recommendations);
    }
}

// Tracking conversii
function wooboost_track_conversion($order_id) {
    $order = wc_get_order($order_id);
    
    send_conversion_to_api([
        'store_id' => get_store_id(),
        'order_id' => $order_id,
        'items' => $order->get_items(),
        'total' => $order->get_total()
    ]);
}
```

---

### **2. VERCEL API (Backend Serverless)**

**Tehnologii:**
- TypeScript + Vercel Serverless Functions
- Firebase Admin SDK pentru database
- Vercel Edge Config pentru caching
- Firebase Auth pentru autentificare

**Endpoints:**
```typescript
// /api/recommendations.ts
// Returnează recomandări pentru un produs
import { VercelRequest, VercelResponse } from '@vercel/node';
import { getFirestore } from 'firebase-admin/firestore';
import { getEdgeConfig } from '@vercel/edge-config';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { store_id, product_id, cart_value } = req.body;
    
    // Check Edge Config cache
    const cacheKey = `rec:${store_id}:${product_id}`;
    const cached = await getEdgeConfig(cacheKey);
    if (cached) return res.json(cached);
    
    // Call AI Engine
    const recommendations = await aiEngine.getRecommendations({
        store_id,
        product_id,
        cart_value
    });
    
    // Store in Firestore + cache
    const db = getFirestore();
    await db.collection('recommendations').add({
        ...recommendations,
        createdAt: new Date()
    });
    
    res.json(recommendations);
}

// POST /api/v1/conversion
// Tracking conversii
app.post('/api/v1/conversion', async (req, res) => {
    const { store_id, recommendation_id, converted, revenue } = req.body;
    
    await db.conversions.create({
        store_id,
        recommendation_id,
        converted,
        revenue,
        timestamp: new Date()
    });
    
    // Trigger AI retraining
    await aiEngine.updateModel(store_id);
    
    res.json({ success: true });
});

// GET /api/v1/analytics
// Dashboard analytics
app.get('/api/v1/analytics', async (req, res) => {
    const { store_id, period } = req.query;
    
    const analytics = await db.analytics.getStats({
        store_id,
        period
    });
    
    res.json(analytics);
});
```

---

### **3. AI ENGINE (Hybrid Approach)**

**Strategie:**
- **80% Reguli clasice** (gratuit, rapid)
- **20% AI Groq** (pentru edge cases)

**Algoritmi:**

```python
# Collaborative Filtering (reguli clasice)
def get_collaborative_recommendations(store_id, product_id):
    # "Cine a cumpărat X a cumpărat și Y"
    query = """
        SELECT p2.product_id, COUNT(*) as frequency
        FROM orders o1
        JOIN order_items oi1 ON o1.order_id = oi1.order_id
        JOIN order_items oi2 ON o1.order_id = oi2.order_id
        JOIN products p2 ON oi2.product_id = p2.product_id
        WHERE oi1.product_id = %s
          AND oi2.product_id != %s
          AND o1.store_id = %s
        GROUP BY p2.product_id
        ORDER BY frequency DESC
        LIMIT 5
    """
    
    return db.execute(query, [product_id, product_id, store_id])

# AI Groq (pentru situații complexe)
def get_ai_recommendations(store_id, product_id, context):
    # Doar pentru:
    # - Produse noi (fără istoric)
    # - Situații complexe
    # - Optimizare avansată
    
    prompt = f"""
    Store: {store_id}
    Product: {product_id}
    Context: {context}
    
    Recomandă 3 produse complementare bazat pe:
    - Categoria produsului
    - Prețul produsului
    - Istoricul magazinului
    
    Format JSON:
    {{
        "recommendations": [
            {{"product_id": "...", "reason": "...", "probability": 0.8}}
        ]
    }}
    """
    
    response = groq_api.complete(prompt)
    return parse_json(response)

# Hybrid Engine
def get_recommendations(store_id, product_id):
    # 1. Încearcă cache
    cached = redis.get(f"rec:{store_id}:{product_id}")
    if cached:
        return cached
    
    # 2. Încearcă reguli clasice
    classic_recs = get_collaborative_recommendations(store_id, product_id)
    if len(classic_recs) >= 3:
        return classic_recs  # 80% din cazuri
    
    # 3. Folosește AI pentru edge cases
    ai_recs = get_ai_recommendations(store_id, product_id, context)
    return ai_recs  # 20% din cazuri
```

---

### **4. FIREBASE FIRESTORE SCHEMA**

**Collections:**

```typescript
// stores collection
stores: {
  [storeId: string]: {
    name: string
    url: string
    apiKey: string
    plan: 'starter' | 'growth' | 'pro'
    status: 'trial' | 'active' | 'cancelled'
    userId: string              // Firebase Auth UID
    createdAt: Timestamp
    settings: {
      displayType: 'popup' | 'banner'
      enableUpsell: boolean
      enableCrossSell: boolean
      locations: string[]       // ['product', 'cart', 'checkout']
    }
  }
}

// products collection
products: {
  [productId: string]: {
    storeId: string
    name: string
    price: number
    category: string
    sku: string
    stock: number
    imageUrl?: string
    createdAt: Timestamp
  }
}

// orders collection
orders: {
  [orderId: string]: {
    storeId: string
    total: number
    items: Array<{
      productId: string
      quantity: number
      price: number
    }>
    createdAt: Timestamp
  }
}

// recommendations collection
recommendations: {
  [recId: string]: {
    storeId: string
    productId: string
    recommendedProducts: Array<{
      productId: string
      probability: number
      reason: string
    }>
    algorithm: 'collaborative' | 'ai' | 'hybrid'
    createdAt: Timestamp
    expiresAt: Timestamp
  }
}

// conversions collection
conversions: {
  [convId: string]: {
    storeId: string
    recId: string
    productId: string
    converted: boolean
    revenue: number
    displayLocation: string
    createdAt: Timestamp
  }
}

// analytics_daily collection (aggregated)
analytics_daily: {
  [docId: string]: {
    storeId: string
    date: string              // YYYY-MM-DD
    totalRevenue: number
    upsellRevenue: number
    conversions: number
    impressions: number
    conversionRate: number
    avgOrderValue: number
  }
}

// users collection (Firebase Auth linked)
users: {
  [userId: string]: {
    email: string
    displayName: string
    stores: string[]          // array of storeIds
    subscription: {
      plan: string
      status: string
      stripeCustomerId?: string
    }
    createdAt: Timestamp
  }
}
```

**Firestore Indexes:**
```json
{
  "indexes": [
    {
      "collectionGroup": "products",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "storeId", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" }
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
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

---

## 🚀 SCALABILITATE

### **Pentru 1,000 clienți:**

**Infrastructure (Vercel + Firebase):**
- **Vercel Pro:** $20/lună (serverless auto-scaling)
- **Firebase Blaze Plan:**
  - Firestore: ~$50-100/lună (1M reads, 500K writes)
  - Storage: ~$10/lună
  - Functions: ~$20/lună
- **Vercel Edge Config:** $10/lună (caching)
- **AI (Groq):** $250/lună (hybrid strategy)
- **Stripe:** 2.9% + $0.30 per transaction

**Costuri lunare:**
- Vercel: $20/lună
- Firebase: $80-130/lună
- Edge Config: $10/lună
- AI (Groq): $250/lună
- Stripe: ~$2,000/lună (2.9% din $71,100)
- **TOTAL: ~$2,360-2,410/lună**

**Venit:** 1,000 × $79 (avg) = $79,000/lună
**Profit:** $76,590/lună (97% margin!) 🔥

**Avantaje vs stack anterior:**
- ✅ Zero DevOps (managed services)
- ✅ Auto-scaling (fără configurare)
- ✅ Deploy instant (git push)
- ✅ Real-time updates (Firestore)
- ✅ Built-in auth & security

---

## 🔒 SECURITATE

✅ **API Keys** - unice per client
✅ **HTTPS** - toate comunicările
✅ **Rate Limiting** - 100 requests/min per client
✅ **Data Encryption** - la rest și în tranzit
✅ **GDPR Compliant** - ștergere date la cerere
✅ **Backup** - zilnic, 30 zile retention

---

## 📊 MONITORING

**Tools:**
- **Sentry** - error tracking
- **Datadog** - performance monitoring
- **Grafana** - dashboards custom
- **PagerDuty** - alerting

**Metrici:**
- API response time (target: <100ms)
- Cache hit rate (target: >90%)
- Error rate (target: <0.1%)
- Uptime (target: 99.9%)

---

**Creat:** 31 Octombrie 2025
**Status:** Architecture Design
