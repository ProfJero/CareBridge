import { useQuery } from "@tanstack/react-query";
import { must, sb } from "@/lib/supabase";
import { PRODUCT_SELECT, type Category, type Product, type Store, type Video } from "@/lib/types";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => must(await sb().from("categories").select("*").order("sort")) as Category[],
    staleTime: 5 * 60_000,
  });
}

export type ProductFilters = {
  q?: string;
  category?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "popular" | "rating";
  min?: number;
  max?: number;
  inStock?: boolean;
  storeId?: string;
  featured?: boolean;
  limit?: number;
};

export function useProducts(filters: ProductFilters, categories: Category[] | undefined) {
  return useQuery({
    queryKey: ["products", filters, categories?.length ?? 0],
    enabled: !filters.category || Boolean(categories),
    queryFn: async () => {
      let query = sb().from("products").select(PRODUCT_SELECT, { count: "exact" }).eq("status", "active");
      const q = filters.q?.trim().replace(/[%,()]/g, " ");
      if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
      if (filters.category) {
        const cat = categories?.find((item) => item.slug === filters.category);
        if (cat) query = query.eq("category_id", cat.id);
      }
      if (filters.min !== undefined) query = query.gte("price", filters.min);
      if (filters.max !== undefined) query = query.lte("price", filters.max);
      if (filters.inStock) query = query.gt("stock", 0);
      if (filters.storeId) query = query.eq("store_id", filters.storeId);
      if (filters.featured) query = query.eq("featured", true);
      switch (filters.sort) {
        case "price-asc":
          query = query.order("price", { ascending: true });
          break;
        case "price-desc":
          query = query.order("price", { ascending: false });
          break;
        case "popular":
          query = query.order("sold_count", { ascending: false });
          break;
        case "rating":
          query = query.order("rating_avg", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }
      const { data, error, count } = await query.limit(filters.limit ?? 24);
      if (error) throw new Error(error.message);
      return { products: (data ?? []) as Product[], count: count ?? 0 };
    },
  });
}

export function useVideos(limit = 60) {
  return useQuery({
    queryKey: ["videos", limit],
    queryFn: async () =>
      must(
        await sb()
          .from("videos")
          .select("*")
          .eq("published", true)
          .eq("is_tutorial", false)
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(limit),
      ) as Video[],
  });
}

export type PlatformSettings = {
  seller_fee_percent: number;
  fees_enabled: boolean;
  fee_note: string;
  free_delivery: boolean;
};

export function usePlatformSettings() {
  return useQuery({
    queryKey: ["platform-settings"],
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await sb().from("platform_settings").select("*").eq("id", 1).maybeSingle();
      return (data as PlatformSettings | null) ?? { seller_fee_percent: 0, fees_enabled: false, fee_note: "Selling on SamBee is free for now.", free_delivery: true };
    },
  });
}

export type StoreWithCount = Store & { products: { count: number }[] };

/** Active shops, newest first, with how many live products each has. */
export function useStores(limit = 60) {
  return useQuery({
    queryKey: ["stores", limit],
    queryFn: async () => {
      const { data, error } = await sb()
        .from("stores")
        .select("*, products(count)")
        .eq("status", "active")
        .eq("products.status", "active")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw new Error(error.message);
      return (data ?? []) as StoreWithCount[];
    },
  });
}

export function useTutorials() {
  return useQuery({
    queryKey: ["tutorials"],
    queryFn: async () =>
      must(await sb().from("videos").select("*").eq("published", true).eq("is_tutorial", true).order("sort").order("created_at")) as Video[],
  });
}

/** Fire-and-forget view counter for shop analytics (one per page view per tab session). */
export function trackView(kind: "product" | "store", id: string) {
  if (typeof window === "undefined") return;
  try {
    const key = `sambee.viewed.${kind}.${id}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
  } catch {
    /* storage unavailable: still count */
  }
  // Supabase query builders are lazy: they only send the request once awaited/then'd.
  sb()
    .rpc("track_view", { p_kind: kind, p_id: id })
    .then(
      () => undefined,
      () => undefined,
    );
}
