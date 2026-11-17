import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  title: string;
  price: number;
  image: string | null;
  storeId: string;
  storeName: string;
  stock: number;
  quantity: number;
};

type CartState = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((item) => item.productId === line.productId);
          if (existing) {
            return {
              lines: state.lines.map((item) =>
                item.productId === line.productId
                  ? { ...item, ...line, quantity: Math.min(line.stock, item.quantity + quantity) }
                  : item,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: Math.min(line.stock, quantity) }] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          lines: state.lines.map((item) =>
            item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(item.stock, quantity)) } : item,
          ),
        })),
      remove: (productId) => set((state) => ({ lines: state.lines.filter((item) => item.productId !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: "sambea.cart",
      storage: createJSONStorage(() => (typeof window === "undefined" ? (undefined as never) : window.localStorage)),
      skipHydration: true,
    },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
