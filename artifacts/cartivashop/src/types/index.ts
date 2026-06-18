export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  description: string;
  shortDescription: string;
  images: string[];
  category: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  inStock: boolean;
  featured: boolean;
  colors?: string[];
  specs?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
}

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  perks: string[];
  icon: string;
}

export interface UserProfile {
  id: string;
  full_name: string;
  phone: string;
  default_address: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
  total: number;
  shipping_address: string;
  payment_id: string;
  status: string;
  created_at: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}
