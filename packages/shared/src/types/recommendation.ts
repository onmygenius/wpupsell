export interface Recommendation {
  id: string;
  storeId: string;
  productId: string;
  recommendedProducts: RecommendedProduct[];
  algorithm: 'collaborative' | 'ai' | 'hybrid';
  createdAt: Date;
  expiresAt: Date;
  cacheHit: boolean;
}

export interface RecommendedProduct {
  productId: string;
  probability: number;
  reason: string;
  score: number;
}

export interface RecommendationRequest {
  store_id: string;
  product_id: string;
  cart_value?: number;
  user_history?: string[];
}

export interface RecommendationResponse {
  recommendations: RecommendedProduct[];
  algorithm: string;
  cached: boolean;
}
