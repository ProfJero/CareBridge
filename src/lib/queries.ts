import { useQuery } from "@tanstack/react-query";
import { must, sb } from "@/lib/supabase";
import { PRODUCT_SELECT, type Category, type Product, type Video } from "@/lib/types";

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
          .order("featured", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(limit),
      ) as Video[],
  });
}
