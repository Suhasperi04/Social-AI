import { create } from "zustand";
import { InstagramAccount, Usage } from "@/types";

interface AuthState {
  account: InstagramAccount | null;
  usage: Usage | null;
  isLoading: boolean;
  setAccount: (account: InstagramAccount | null) => void;
  setUsage: (usage: Usage | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  account: null,
  usage: null,
  isLoading: true,
  setAccount: (account) => set({ account }),
  setUsage: (usage) => set({ usage }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ account: null, usage: null }),
}));
