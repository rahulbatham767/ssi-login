import { create } from "zustand";
import axios from "axios";
import {
  generateCredentialPayload,
  generateJwtToken,
  generateProofRequest,
} from "../utils/template";
import { useRouter } from "next/navigation";

const apiCall = async (method, endpoint, data = null) => {
  const baseUrl = process.env.NEXT_PUBLIC_VERIFIER_ENDPOINT;
  try {
    console.log(data);
    const response = await axios[method](`${baseUrl}${endpoint}`, data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.message || "Something went wrong"
    );
  }
};

const useVerifierStore = create((set) => ({
  loading: false,
  error: null,
  proofRequests: [],
  connections: [],
  Invitation: [],
  ws: null,
  connected: false,
  // Create Invitation function
  createInvitation: async () => {
    set({ loading: true, error: null, successStatus: null }); // Start by setting loading state and clearing previous state
    try {
      // Make the API call to create the invitation
      const data = await apiCall(
        "post", // HTTP method
        `/out-of-band/create-invitation`, // Endpoint to create the invitation
        {
          handshake_protocols: ["https://didcomm.org/didexchange/1.0"], // Protocols used for the handshake
        }
      );

      // Log the invitation data and update the state with the invitation
      console.log("create invitation ", data.invitation);
      set({
        Invitation: data, // Store the invitation data in the state
        loading: false, // Stop the loading spinner
        successStatus: true, // Indicate success
      });
    } catch (error) {
      // Handle any errors that occur during the API call
      set({
        error: error.message, // Store the error message
        loading: false, // Stop loading
        successStatus: false, // Indicate failure
      });
    }
  },
  userInvitation: async () => {
    set({ loading: true, error: null, successStatus: null }); // Start by setting loading state and clearing previous state
    try {
      // Make the API call to receive the invitation
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_HOLDER_ENDPOINT}/out-of-band/create-invitation`,
        {
          handshake_protocols: ["https://didcomm.org/didexchange/1.0"], // Protocols used for the handshake
        }
      );
      // Update the state with the received invitation data
      set({
        Invitation: response.data, // Store the received invitation data
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

  // Receive Invitation function
  RecieveInvitation: async (data) => {
    set({ loading: true, error: null, successStatus: null }); // Start by setting loading state and clearing previous state
    try {
      // Make the API call to receive the invitation
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_ISSUER_ENDPOINT}/out-of-band/receive-invitation`,
        data
      );
      // Update the state with the received invitation data
      set({
        Invitation: response.data, // Store the received invitation data
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
  setConnected: (status) => set({ connected: status }),
  connect: (url, type) => {
    if (!url) {
      console.error("WebSocket URL not found for the user role");
      return;
    }

    console.log("Connecting to WebSocket:", url);
    const ws = new WebSocket(url);
    let redirected = false; // Flag to prevent multiple redirects

    ws.onopen = () => {
      set({ connected: true });
      console.log("✅ WebSocket connected");
    };

    ws.onmessage = async (event) => {
      const { topic, payload } = JSON.parse(event.data);
      console.log("Received message:", topic, payload);

      if (type === "verifier") {
        if (topic === "ping") return; // Ignore ping messages

        if (topic === "connections") {
          console.log("Payload in connections:", payload);

          if (payload.rfc23_state === "completed" && !redirected) {
            // Step 1: Create JWT token with user information
            const userName = payload.their_label || "User"; // Assuming 'their_label' contains the user name
            try {
              const proofRequest = generateProofRequest({
                connection_id: payload.connection_id, // Required
                cred_def_id: "5dyaWPcQ5RoddcHH2dpmYE:3:CL:13:token", // Credential definition ID
              });

              console.log(
                "Generated proofRequest:",
                JSON.stringify(proofRequest, null, 2)
              ); // Better logging for debugging
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_VERIFIER_ENDPOINT}/present-proof-2.0/send-request`,
                proofRequest,
                {
                  headers: { "Content-Type": "application/json" },
                }
              );

              console.log("✅ Proof request sent successfully:", response.data);
            } catch (error) {
              console.error(
                "❌ Error sending proof request:",
                error.response?.data || error.message
              );
              return null;
            }
          }
        }
        if (topic === "present_proof_v2_0" && payload.verified === "true") {
          console.log("✅ Proof verified successfully!");

          // Close WebSocket after verification
          ws.close();

          // Redirect to home page
          window.location.href = "/";
        }
      }
      if (type === "issuer") {
        if (topic === "out_of_band" && payload.state === "done") {
          if (!payload.connection_id) {
            console.error("❌ Connection ID missing in 'done' state payload.");
            return;
          }

          console.log("✅ Connection established. ID:", payload.connection_id);

          const token = await generateJwtToken({ name, email });
          console.log("🔑 Token generated:", token);

          const credentialPayload = generateCredentialPayload({
            connection_id: payload.connection_id,
            token,
            issuer_did: "5dyaWPcQ5RoddcHH2dpmYE",
            cred_def_id: "5dyaWPcQ5RoddcHH2dpmYE:3:CL:13:token",
          });

          console.log("📄 Credential Payload:", credentialPayload);

          try {
            const response = await axios.post(
              "http://172.18.7.14:8021/issue-credential-2.0/send",
              credentialPayload,
              { headers: { "Content-Type": "application/json" } }
            );

            console.log("✅ Credential issued successfully:", response.data);

            // 🔌 Close WebSocket after issuing credential
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.close();
              console.log("🔌 WebSocket manually disconnected.");
            }

            // Redirect after success
            router.push("/login");
          } catch (err) {
            console.error(
              "❌ Error issuing credential:",
              err.response?.data || err.message
            );
            setLoading(false);
          }
        }
      }
    };

    ws.onclose = () => {
      set({ connected: false });
      console.log("🔌 WebSocket disconnected");
    };

    set({ ws });

    // Cleanup WebSocket on unmount
    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
        console.log("🔌 WebSocket connection closed on cleanup");
      }
    };
  },
  disconnect: () => {
    const ws = get().ws; // Retrieve the WebSocket from state
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.close(); // Close the WebSocket connection
      console.log("🔌 WebSocket manually disconnected");
      set({ connected: false }); // Update state to reflect disconnection
    }
  },
  // Fetch proof requests
  fetchProofRequests: async () => {
    set({ loading: true, error: null });
    try {
      const data = await apiCall("get", "/proof-requests");
      set((state) => {
        const updatedState = { ...state, proofRequests: data, loading: false };
        localStorage.setItem("verifierStore", JSON.stringify(updatedState));
        return updatedState;
      });
    } catch (error) {
      set((state) => {
        const updatedState = { ...state, error: error.message, loading: false };
        localStorage.setItem("verifierStore", JSON.stringify(updatedState));
        return updatedState;
      });
    }
  },

  // Send proof verification request
  sendProofRequest: async (proofRequest) => {
    set({ loading: true, error: null });
    try {
      const data = await apiCall("post", "/send-proof-request", proofRequest);
      set((state) => {
        const updatedState = {
          ...state,
          proofRequests: [...state.proofRequests, data],
          loading: false,
        };
        localStorage.setItem("verifierStore", JSON.stringify(updatedState));
        return updatedState;
      });
    } catch (error) {
      set((state) => {
        const updatedState = { ...state, error: error.message, loading: false };
        localStorage.setItem("verifierStore", JSON.stringify(updatedState));
        return updatedState;
      });
    }
  },

  // Clear errors
  clearError: () =>
    set((state) => {
      const updatedState = { ...state, error: null };
      localStorage.setItem("verifierStore", JSON.stringify(updatedState));
      return updatedState;
    }),
}));

export default useVerifierStore;
