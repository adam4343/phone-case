import { create } from "zustand";

interface PriceState {
  modelPrice: number;
  materialPrice: number;
  totalPrice: number;

  setModelPrice: (price: number) => void;
  setMaterialPrice: (price: number) => void;
  calculateTotal: () => void;
  reset: () => void;
}

export const usePriceStore = create<PriceState>((set, get) => ({
  modelPrice: 0,
  materialPrice: 0,
  totalPrice: 0,

  setModelPrice: (price) => {
    set({ modelPrice: price });
    get().calculateTotal();
  },

  setMaterialPrice: (price) => {
    set({ materialPrice: price });
    get().calculateTotal();
  },

  calculateTotal: () => {
    const { modelPrice, materialPrice } = get();
    set({ totalPrice: modelPrice + materialPrice });
  },

  reset: () => {
    set({
      modelPrice: 0,
      materialPrice: 0,
      totalPrice: 0,
    });
  },
}));
