export interface Store {
  id: string;
  name: string;
  url: string;
  apiKey: string;
  plan: 'starter' | 'growth' | 'pro';
  status: 'trial' | 'active' | 'cancelled';
  userId: string;
  createdAt: Date;
  trialEndsAt?: Date;
  settings: StoreSettings;
}

export interface StoreSettings {
  displayType: 'popup' | 'banner' | 'inline';
  enableUpsell: boolean;
  enableCrossSell: boolean;
  locations: ('product' | 'cart' | 'checkout')[];
  discountPercent: number;
}
