import Cookies from "js-cookie";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useUserStore = create(
  persist(
    (set, get) => ({
      loading: false,
      error: null,
      proofRequests: [],
      connections: [],
      invitation: null,
      isLoggedIn: false, // Initialize without accessing localStorage

      ws: null,
      connected: false,
      redirected: false,

      setIsLoggedIn: (value) => set({ isLoggedIn: value }),

      clearError: () => set({ error: null }),
    }),
    {
      name: "verifier-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : null)), // Avoid SSR issue
      onRehydrateStorage: () => (state) => {
        if (typeof window !== "undefined") {
          state.setIsLoggedIn(!!localStorage.getItem("Token")); // Safe access
        }
      },
    }
  )
);

export default useUserStore;
