import { create } from "zustand";
import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";
import {
  handleHolderMessages,
  handleIssuerMessages,
  handleVerifierMessages,
} from "../utils/user_agent";
import apiCall from "../utils/apiCall";

// const apiCall = async (baseUrl, method, endpoint, data = null) => {
//   try {
//     const response = await axios[method](`${baseUrl}${endpoint}`, data);
//     return response.data;
//   } catch (error) {
//     console.error("API Error:", error.response?.data || error.message);
//     throw new Error(
//       error.response?.data?.message || error.message || "Something went wrong"
//     );
//   }
// };

const useVerifierStore = create(
  (set, get) => ({
  loading: false,
  error: null,
  proofRequests: [],
  connections: [],
  invitation: null,
  isLoggedIn: Cookies.get("userToken") ? true : false,
  ws: null,
  retryCount: 0,
  wsConnections: {},
  connected: false,
  connectedRoles: [], // Track which roles are connected
  token: null,
  redirected: false,
  setToken: (token) => set({ token }),
  registerReq: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiCall(
        process.env.NEXT_PUBLIC_HOLDER_ENDPOINT,
        "post",
        "/out-of-band/create-invitation",
        {
          handshake_protocols: ["https://didcomm.org/didexchange/1.0"],
        }
      );
      set({ invitation: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  issuerRecInvitation: async (data) => {
    set({ loading: true, error: null, successStatus: null }); // Start by setting loading state and clearing previous state
    try {
      // Make the API call to receive the invitation
      const response = await apiCall(
        process.env.NEXT_PUBLIC_ISSUER_ENDPOINT,
        "post",
        "/out-of-band/receive-invitation",
        data
      );
      // Update the state with the received invitation data
      set({
        // Store the received invitation data
        loading: false, // Stop the loading spinner
        successStatus: true, // Indicate success
      });
    } catch (error) {
      // Handle any errors that occur during the API call
      console.log("error message in receive", error.message);
      set({
        error: error.message, // Store the error message
        loading: false, // Stop loading
        successStatus: false, // Indicate failure
      });
    }
  },
  VerifierReq: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiCall(
        process.env.NEXT_PUBLIC_VERIFIER_ENDPOINT,
        "post",
        "/out-of-band/create-invitation",
        {
          handshake_protocols: ["https://didcomm.org/didexchange/1.0"],
        }
      );
      set({ invitation: data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  setConnected: (status) => set({ connected: status }),

  connectWebSocket: (url, type) => {
    if (!url || (!url.startsWith("ws://") && !url.startsWith("wss://"))) {
      console.error("Invalid WebSocket URL:", url);
      return;
    }

    if (get().wsConnections[type]) {
      console.warn(`[${type.toUpperCase()}] WebSocket already connected.`);
      return;
    }

    console.log(`[${type.toUpperCase()}] Connecting WebSocket to:`, url);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log(`[${type.toUpperCase()}] WebSocket connected.`);
      set((state) => ({
        wsConnections: { ...state.wsConnections, [type]: ws },
        connectedRoles: [...state.connectedRoles, type],
      }));
    };

    ws.onerror = (err) => {
      console.error("WebSocket Error:", err);
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);

        const { topic, payload } = message;
        if (topic !== "ping")
          console.log(
            `[${new Date().toISOString()}] WebSocket Message:`,
            topic,
            payload
          );
        if (type === "verifier") {
          handleVerifierMessages(topic, payload);
        } else if (type === "holder") {
          handleHolderMessages(topic, payload);
        } else if (type === "issuer") {
          console.log("token in store",  get().token);
          handleIssuerMessages(topic, payload, get().token);
        }

        // Verifier logic of sending proof request to the holder

        // Issuer logic
      } catch (error) {
        console.error("Error processing WebSocket message:", error);

        toast.error("Something went wrong while processing the Request");
        // Consider adding user-facing error handling here
      }
    };
    const MAX_RETRIES = 5;
    // ws.onclose = () => {
    //   console.warn(`[${new Date().toISOString()}] WebSocket closed.`);

    //   set({ connected: false, ws: null });

    //   if (retryCount < MAX_RETRIES) {
    //     retryCount++;
    //     const retryDelay = Math.min(5000 * retryCount, 30000); // Exponential backoff
    //     console.warn(
    //       `Reconnecting in ${
    //         retryDelay / 1000
    //       } seconds (attempt ${retryCount}/${MAX_RETRIES})...`
    //     );
    //     setTimeout(() => get().connectWebSocket(url, type, token), retryDelay);
    //   } else {
    //     console.error(
    //       "Max reconnect attempts reached. WebSocket will not reconnect."
    //     );
    //   }
    // };


    ws.onclose = () => {
      console.warn(`[${new Date().toISOString()}] WebSocket closed.`);
      set((state) => {
         const updatedConnections = { ...state.wsConnections };
         delete updatedConnections[type];
   
         return {
            connected: false,
            wsConnections: updatedConnections,
            connectedRoles: state.connectedRoles.filter(role => role !== type),
         };
      });
   };
    set({ ws });
  },

  disconnectWebSocket: () => {
    const ws = get().ws;
    if (ws) {
      console.log("Disconnecting WebSocket...");
      ws.close();
    }
    set({ connected: false, ws: null });
  },

  fetchProofRequests: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiCall("get", "/proof-requests");
      set({ proofRequests: data, loading: false });
      localStorage.setItem(
        "verifierStore",
        JSON.stringify({ proofRequests: data })
      );
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  sendProofRequest: async (proofRequest) => {
    set({ loading: true, error: null });
    try {
      const data = await apiCall("post", "/send-proof-request", proofRequest);
      set((state) => {
        const updatedState = {
          proofRequests: [...state.proofRequests, data],
          loading: false,
        };
        localStorage.setItem("verifierStore", JSON.stringify(updatedState));
        return updatedState;
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useVerifierStore;
