export interface Conversion {
  id: string;
  storeId: string;
  recId: string;
  productId: string;
  converted: boolean;
  revenue: number;
  displayLocation: 'product' | 'cart' | 'checkout';
  deviceType: 'desktop' | 'mobile' | 'tablet';
  createdAt: Date;
}

export interface AnalyticsDaily {
  id: string;
  storeId: string;
  date: string; // YYYY-MM-DD
  totalRevenue: number;
  upsellRevenue: number;
  conversions: number;
  impressions: number;
  conversionRate: number;
  avgOrderValue: number;
  topProducts: TopProduct[];
}

export interface TopProduct {
  productId: string;
  revenue: number;
  conversions: number;
}
