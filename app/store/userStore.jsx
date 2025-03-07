import Cookies from "js-cookie";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const userStore = create(
  persist(
    (set, get) => ({
      loading: false,
      error: null,
      proofRequests: [],
      connections: [],
      invitation: null,
      isLoggedIn: localStorage.getItem("Token") ? true : false,// Check sessionStorage
      ws: null,
      connected: false,
      redirected: false,

      
      
      clearError: () => set({ error: null }),
    }),
    {
        name: "verifier-storage", // Unique key for localStorage
        storage: createJSONStorage(() => localStorage), // Explicitly define localStorage
      }
  )
);

export default userStore;
