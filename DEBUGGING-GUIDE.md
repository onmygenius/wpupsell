# 🔍 DEBUGGING GUIDE - WooCommerce UpSell AI

## ✅ Ce am rezolvat

### **Problema identificată:**
- API-ul căuta produsele în Firestore (care erau goale)
- Plugin-ul trimitea produsele dar API-ul nu le folosea
- Lipsă de logging pentru debugging

### **Soluții implementate:**

#### **1. API Fix (`apps/api/api/recommendations.ts`)**
- ✅ Acceptă `availableProducts` direct din request
- ✅ Nu mai depinde de Firestore pentru produse
- ✅ Validare mai bună a input-ului
- ✅ Returnează `recommendation_id` pentru tracking

#### **2. Plugin Fix (`apps/plugin/includes/API/Client.php`)**
- ✅ Logging detaliat pentru fiecare request
- ✅ Validare status code și JSON
- ✅ Error handling îmbunătățit

#### **3. Frontend Fix (`apps/plugin/includes/Frontend/Recommendations.php`)**
- ✅ Logging pentru fiecare pas
- ✅ Debugging pentru AJAX requests

---

## 🧪 Cum să testezi

### **Pas 1: Verifică configurația**

În WordPress Admin → UpSell AI Settings:
- ✅ API Key este setat
- ✅ Store ID este generat automat
- ✅ "Enable Recommendations" este bifat

### **Pas 2: Verifică că ai produse**

- Minim 3-5 produse publicate în WooCommerce
- Produsele au preț setat
- Produsele au categorii

### **Pas 3: Testează pe o pagină de produs**

1. Deschide o pagină de produs în frontend
2. Scroll down după descriere
3. Ar trebui să vezi "Loading AI recommendations..."
4. După 2-5 secunde → recomandări apar

---

## 📊 Verificare Logs

### **WordPress Debug Logs**

Activează debugging în `wp-config.php`:

```php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

Logs se salvează în: `wp-content/debug.log`

### **Ce să cauți în logs:**

```
✅ SUCCESS FLOW:
UpSell AI: AJAX request for product ID: 123
UpSell AI: Current product: iPhone 15 Pro
UpSell AI: Found 10 available products
UpSell AI: Formatted 10 products for API
UpSell AI: Sending request to https://wpupsell-dashboard.vercel.app/api/recommendations
UpSell AI: Request data - Products count: 10
UpSell AI: Response status: 200
UpSell AI: Success - Received 3 recommendations
UpSell AI: API response received: Array(...)
UpSell AI: Sending 3 formatted recommendations to frontend

❌ ERROR FLOW (API Key missing):
UpSell AI: API key or Store ID not configured

❌ ERROR FLOW (No products):
UpSell AI: Found 0 available products

❌ ERROR FLOW (API error):
UpSell AI: API returned error status 400
```

---

## 🔧 Troubleshooting

### **Problem: "API key or Store ID not configured"**

**Soluție:**
1. Mergi la WordPress Admin → UpSell AI
2. Introdu API Key din dashboard
3. Salvează setările
4. Reîmprospătează pagina produsului

### **Problem: "No recommendations shown"**

**Verificări:**
1. ✅ Ai minim 3 produse publicate?
2. ✅ API Key este corect?
3. ✅ Produsele au preț setat?
4. ✅ Verifică `debug.log` pentru erori

### **Problem: "API returned status 400/500"**

**Cauze posibile:**
- API-ul Vercel nu este deployed
- Environment variables lipsesc (GROQ_API_KEY, FIREBASE_*)
- Request format invalid

**Verificare API:**
```bash
curl -X POST https://wpupsell-dashboard.vercel.app/api/health
```

Ar trebui să returneze: `{"status": "ok"}`

### **Problem: "CORS errors in browser console"**

**Soluție:**
- API-ul are deja CORS headers setate
- Verifică că URL-ul API este corect în `upsell-ai.php`:
  ```php
  define('UPSELLAI_API_URL', 'https://wpupsell-dashboard.vercel.app/api');
  ```

---

## 🚀 Verificare API Live

### **Test manual cu cURL:**

```bash
curl -X POST https://wpupsell-dashboard.vercel.app/api/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "storeId": "store_abc123",
    "productId": "123",
    "productName": "iPhone 15 Pro",
    "productCategory": "Electronics",
    "productPrice": 999,
    "availableProducts": [
      {"id": "124", "name": "iPhone Case", "category": "Accessories", "price": 29},
      {"id": "125", "name": "AirPods Pro", "category": "Audio", "price": 249}
    ]
  }'
```

**Răspuns așteptat:**
```json
{
  "success": true,
  "recommendation_id": "abc123xyz",
  "product": {
    "id": "123",
    "name": "iPhone 15 Pro"
  },
  "recommendations": [
    {
      "id": "124",
      "name": "iPhone Case",
      "price": 29,
      "reason": "AI recommended based on product similarity"
    }
  ],
  "algorithm": "groq-ai",
  "timestamp": "2025-11-01T03:24:00.000Z"
}
```

---

## 📝 Checklist Final

Înainte de a declara "funcționează":

- [ ] API Key setat în plugin
- [ ] Minim 3 produse în WooCommerce
- [ ] Debug logs activate
- [ ] Pagină produs vizitată
- [ ] Logs arată "Success - Received X recommendations"
- [ ] Recomandări vizibile pe frontend
- [ ] Click pe "Add to Cart" funcționează
- [ ] Conversion tracking apare în logs

---

## 🆘 Dacă tot nu funcționează

### **Verifică Environment Variables în Vercel:**

1. Mergi la Vercel Dashboard
2. Project Settings → Environment Variables
3. Verifică că există:
   - `GROQ_API_KEY`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

### **Verifică Firebase:**

1. Firebase Console → Firestore Database
2. Verifică că database-ul există
3. Verifică Firestore Rules (ar trebui să permită write pentru authenticated users)

### **Verifică Groq API:**

```bash
curl https://api.groq.com/openai/v1/models \
  -H "Authorization: Bearer YOUR_GROQ_API_KEY"
```

Ar trebui să returneze lista de modele disponibile.

---

## 📞 Contact & Support

Dacă problema persistă:
1. Colectează logs complete din `debug.log`
2. Screenshot din browser console (F12)
3. Screenshot din Network tab (F12 → Network)
4. Trimite toate informațiile pentru debugging

---

**Ultima actualizare:** 1 Noiembrie 2025
**Status:** Plugin și API actualizate și gata de testare
