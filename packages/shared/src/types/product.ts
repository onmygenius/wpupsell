export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  category: string;
  sku: string;
  stock: number;
  imageUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
