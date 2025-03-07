import axios from "axios";
import { toast } from "react-hot-toast";
import {
  deleteCredentialRequest,
  extractTokenDetails,
  generateCredentialPayload,
  generateProofRequest,
  getCredentialID,
  getRequestCredential,
} from "./template";
export const handleVerifierMessages = async (topic, payload) => {
  if (topic !== "ping") {
    console.log("[VERIFIER] Handling message:", topic, payload);
  }
  if (topic === "connections" && payload.rfc23_state === "completed") {
    console.log("Verifier: Processing connection completion");

    const proofRequest = generateProofRequest({
      connection_id: payload.connection_id,
      cred_def_id: process.env.NEXT_PUBLIC_CRED_DEF_ID,
    });

    await axios
      .post(
        `${process.env.NEXT_PUBLIC_VERIFIER_ENDPOINT}/present-proof-2.0/send-request`,
        proofRequest
      )
      .then((res) => {
        console.log("response after sending proof request", res.data); // Log the response
      })
      .catch((error) => {
        // Catch any errors and log them
        console.error(
          "Error sending proof request:",
          error.response?.data || error.message
        );
      });

    if (topic === "present_proof_v2_0") {
      const revealedAttrs =
        payload?.by_format?.pres?.indy?.requested_proof?.revealed_attrs;
      if (revealedAttrs?.token?.raw) {
        localStorage.setItem("Token", revealedAttrs.token.raw);
        axios.post("/api/set-token", { token: revealedAttrs.token.raw });
        // Decode JWT
        const userDetails = extractTokenDetails(revealedAttrs.token.raw);

        console.log("User Details from Token:", userDetails);
        localStorage.setItem("UserDetails", JSON.stringify(userDetails));

        console.log("Verifier: Proof verification successful", payload);
        window.location.href = "/";
      } else {
        console.error("Token not found in revealed attributes");
        console.log("Verifier: Proof verification Failed", payload);
        console.log("topic and payload", topic, payload);
      }
    }
  }
};
export const handleHolderMessages = async (topic, payload) => {
  if (topic !== "ping") {
    console.log("[HOLDER] Handling message:", topic, payload);
  }

  if (payload?.state === "request-received") {
    const id = await getCredentialID();
    console.log("credential id", id);

    const getCredential = await getRequestCredential(id);
    console.log("get credential", getCredential);

    const extractCred = extractTokenDetails(JSON.stringify(getCredential));
    console.log("extracted credential", extractCred);

    if (!extractCred) {
      console.error("❌ Failed to extract credentials");
      return;
    }

    // ✅ Corrected function
    const Approved = (t) => {
      console.log("Approved:", extractCred);

      localStorage.setItem("Token", JSON.stringify(getCredential[0]));
      axios.post("/api/set-token", { token: getCredential });

      console.log("User Details from Token:", getCredential);
      console.log(getCredential);

      localStorage.setItem(
        "UserDetails",
        JSON.stringify(extractTokenDetails(getCredential[0]))
      );

      console.log("Verifier: Proof verification successful", payload);
      toast.dismiss(t.id); // ✅ Now correctly inside function
      window.location.href = "/";
    };

    toast.custom(
      (t) => (
        <div
          style={{
            padding: "16px",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            position: "fixed",
            top: "50%",
            left: "38%",
            zIndex: 9999,
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>
            {" "}
            <strong>Do you want to approve this credential?</strong>
          </h3>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              textTransform: "capitalize",
              background: "#f4f4f4",
              padding: "10px",
              borderRadius: "5px",
              textAlign: "left",
            }}
          >
            <p>
              <strong>Name:</strong>
              {extractCred.name}
            </p>
            <p>
              <strong>Date of Birth:</strong>
              {extractCred.dob}
            </p>
            <p>
              <strong>Email:</strong>
              {extractCred.email}
            </p>
            <p>
              <strong>Credential Number:</strong>
              {extractCred.credentialNo}
            </p>
          </pre>

          <div style={{ marginTop: "12px" }}>
            <button
              style={{
                marginRight: "8px",
                background: "green",
                color: "white",
                padding: "8px 12px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => Approved(t, extractCred)} // ✅ Fixed: Now runs only on click
            >
              Approve
            </button>
            <button
              style={{
                background: "red",
                color: "white",
                padding: "8px 12px",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
              onClick={() => {
                console.log("Rejected:", extractCred);
                deleteCredentialRequest(id);
                toast.dismiss(t.id);
              }}
            >
              Reject
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keeps the popup open until the user selects an option
      }
    );
  }
};

export const handleIssuerMessages = async (topic, payload, token) => {
  if (topic !== "ping") {
    console.log("[ISSUER] Handling message:", topic, payload);
  }
  if (
    topic === "connections" &&
    payload.state === "active" &&
    payload.connection_id
  ) {
    console.log("Issuer: Processing active connection");
    console.log(localStorage.getItem("stoken"));

    const credentialPayload = generateCredentialPayload({
      connection_id: payload.connection_id,
      token: token, // Ensure token is properly defined in scope
      issuer_did: process.env.NEXT_PUBLIC_ISSUER_DID,
      cred_def_id: process.env.NEXT_PUBLIC_CRED_DEF_ID,
    });

    console.log("Sending credential offer");
    const res = await axios.post(
      `${process.env.NEXT_PUBLIC_ISSUER_ENDPOINT}/issue-credential-2.0/send`,
      credentialPayload
    );
    console.log("response after sending credential offer", res.data);

    toast.success("Credential offer sent successfully");
    console.log("Credential offer sent successfully");
    window.location.href = "/login";
  }
};
