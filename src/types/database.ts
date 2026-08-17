/**
 * Hand-authored mirror of the SQL in `supabase/migrations`.
 *
 * Regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json = string | number | boolean | null | { [k: string]: Json | undefined } | Json[];

export type UserRole = "customer" | "staff" | "admin";
export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "refunded" | "failed";
export type PostStatus = "draft" | "published";
export type MessageStatus = "new" | "read" | "replied" | "archived";

export type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  marketing_opt_in: boolean;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: string | null;
  position: number;
  is_featured: boolean;
  created_at: string;
};

export type CollectionRow = {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  cover_image_url: string | null;
  accent_image_url: string | null;
  position: number;
  is_featured: boolean;
  created_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  short_description: string | null;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  unit: string;
  material: string | null;
  width_cm: number | null;
  weight_gsm: number | null;
  care_instructions: string | null;
  origin: string | null;
  colors: string[];
  tags: string[];
  images: string[];
  videos: string[];
  stock_quantity: number;
  min_order_quantity: number;
  category_id: string | null;
  collection_id: string | null;
  status: ProductStatus;
  is_featured: boolean;
  is_new_arrival: boolean;
  is_preorder: boolean;
  preorder_deposit_percent: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type ProductWithRelations = ProductRow & {
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
  collection: Pick<CollectionRow, "id" | "name" | "slug"> | null;
};

export type GalleryItemRow = {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  category: string;
  aspect: "portrait" | "landscape" | "square";
  position: number;
  is_published: boolean;
  created_at: string;
};

export type BlogPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  category: string;
  tags: string[];
  author_name: string;
  author_avatar_url: string | null;
  read_minutes: number;
  status: PostStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AddressRow = {
  id: string;
  user_id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  region: string | null;
  country: string;
  postal_code: string | null;
  is_default: boolean;
  created_at: string;
};

export type OrderRow = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: Json;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image_url: string | null;
  color: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type ReviewRow = {
  id: string;
  product_id: string;
  user_id: string | null;
  author_name: string;
  rating: number;
  title: string | null;
  body: string;
  is_approved: boolean;
  created_at: string;
};

export type WishlistItemRow = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
};

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: MessageStatus;
  created_at: string;
};

export type NewsletterRow = {
  id: string;
  email: string;
  source: string;
  is_active: boolean;
  created_at: string;
};

export type SettingRow = {
  key: string;
  value: Json;
  updated_at: string;
};

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

/**
 * `Insert`/`Update` are permissive by design: defaults and generated columns
 * (ids, timestamps, order numbers) are all optional at the SQL level.
 *
 * `Rels` mirrors the foreign keys declared in SQL. postgrest-js reads it to
 * type embedded selects such as `.select("*, order_items(*)")`, so a missing
 * entry here surfaces as a type error at the call site rather than at runtime.
 */
type Table<Row, Rels extends Relationship[] = []> = {
  Row: Row;
  Insert: Partial<Row>;
  Update: Partial<Row>;
  Relationships: Rels;
};

type FK<Name extends string, Col extends string, Ref extends string> = {
  foreignKeyName: Name;
  columns: [Col];
  isOneToOne: false;
  referencedRelation: Ref;
  referencedColumns: ["id"];
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>;
      categories: Table<CategoryRow, [FK<"categories_parent_id_fkey", "parent_id", "categories">]>;
      collections: Table<CollectionRow>;
      products: Table<
        ProductRow,
        [
          FK<"products_category_id_fkey", "category_id", "categories">,
          FK<"products_collection_id_fkey", "collection_id", "collections">,
        ]
      >;
      gallery_items: Table<GalleryItemRow>;
      blog_posts: Table<BlogPostRow>;
      addresses: Table<AddressRow, [FK<"addresses_user_id_fkey", "user_id", "profiles">]>;
      orders: Table<OrderRow, [FK<"orders_user_id_fkey", "user_id", "profiles">]>;
      order_items: Table<
        OrderItemRow,
        [
          FK<"order_items_order_id_fkey", "order_id", "orders">,
          FK<"order_items_product_id_fkey", "product_id", "products">,
        ]
      >;
      reviews: Table<
        ReviewRow,
        [
          FK<"reviews_product_id_fkey", "product_id", "products">,
          FK<"reviews_user_id_fkey", "user_id", "profiles">,
        ]
      >;
      wishlist_items: Table<
        WishlistItemRow,
        [
          FK<"wishlist_items_user_id_fkey", "user_id", "profiles">,
          FK<"wishlist_items_product_id_fkey", "product_id", "products">,
        ]
      >;
      contact_messages: Table<ContactMessageRow>;
      newsletter_subscribers: Table<NewsletterRow>;
      settings: Table<SettingRow>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      user_role: UserRole;
      product_status: ProductStatus;
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      post_status: PostStatus;
      message_status: MessageStatus;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
