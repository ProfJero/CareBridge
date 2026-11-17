export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  is_admin: boolean;
};

export type Category = { id: number; name: string; slug: string; icon: string; sort: number };

export type Store = {
  id: string;
  owner_id: string | null;
  name: string;
  slug: string;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  phone: string;
  whatsapp: string;
  town: string;
  region: string;
  status: "active" | "suspended";
  verified: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  store_id: string;
  category_id: number | null;
  title: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  tags: string[];
  status: "active" | "draft" | "archived";
  featured: boolean;
  rating_avg: number;
  rating_count: number;
  sold_count: number;
  created_at: string;
  store?: Pick<Store, "id" | "name" | "slug" | "town" | "verified" | "whatsapp" | "phone" | "logo_url"> | null;
  category?: Pick<Category, "id" | "name" | "slug" | "icon"> | null;
};

export type Order = {
  id: string;
  order_number: string;
  buyer_id: string;
  status: OrderStatus;
  payment_method: "cod" | "momo";
  payment_status: "unpaid" | "paid" | "refunded";
  momo_network: string | null;
  momo_number: string | null;
  momo_reference: string | null;
  delivery_method: "delivery" | "pickup";
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_town: string;
  shipping_region: string;
  notes: string;
  subtotal: number;
  delivery_fee: number;
  total: number;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  store_id: string | null;
  title: string;
  image: string | null;
  unit_price: number;
  quantity: number;
  status: OrderStatus;
  created_at: string;
  order?: Order;
};

export type Review = {
  id: string;
  product_id: string;
  user_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

export type Video = {
  id: string;
  title: string;
  description: string;
  category: string;
  source: "youtube" | "cloudinary";
  youtube_id: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  published: boolean;
  featured: boolean;
  created_at: string;
};

export type CareRequest = {
  id: string;
  name: string;
  phone: string;
  email: string;
  service: string;
  town: string;
  message: string;
  status: "new" | "contacted" | "closed";
  created_at: string;
};

export const PRODUCT_SELECT =
  "*, store:stores(id,name,slug,town,verified,whatsapp,phone,logo_url), category:categories(id,name,slug,icon)";
