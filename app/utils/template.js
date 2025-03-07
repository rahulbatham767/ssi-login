import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const extractTokenDetails = (token) => {
  try {
    const decoded = jwtDecode(token);
    console.log("Decoded Token:", decoded);
    return decoded;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export async function generateJwtToken(user) {
  try {
    const response = await axios.post("/api/generate-token", user);
    return response.data.token;
  } catch (error) {
    console.error(
      "Error generating JWT token:",
      error.response?.data || error.message
    );
    return null;
  }
}

export const generateProofRequest = ({ connection_id, cred_def_id }) => {
  const currentTimestamp = Math.floor(Date.now() / 1000); // Current time in seconds

  const data = {
    connection_id,
    comment: "Proof request for token verification",
    presentation_request: {
      indy: {
        name: "Token verification",
        version: "1.0",
        nonce: String(Math.floor(Math.random() * 1e9)), // Generate random nonce
        non_revoked: {
          from: currentTimestamp - 3600, // 1 hour ago
          to: currentTimestamp, // Now
        },
        requested_attributes: {
          token: {
            name: "token",
            non_revoked: {
              from: currentTimestamp - 3600,
              to: currentTimestamp,
            },
            restrictions: [
              {
                cred_def_id, // Correct key for credential definition ID
              },
            ],
            revealed: true,
          },
        },
        requested_predicates: {},
      },
    },
    trace: false,
  };
  return data;
};

export function Issue_Token_Credential(issuer) {
  // Create the context object dynamically for the token
  const context = {
    "https://www.w3.org/2018/credentials/v1": {},
  };

  // Add the token attribute to the context
  context["https://www.w3.org/2018/credentials/v1"]["token"] =
    "https://example.org/vocab/token";

  // Dynamically build credentialSubject for token
  const credentialSubject = {
    token: issuer.token, // Only include the token attribute
  };

  // Create the payload
  const payload = {
    comment: "Here is Your Token Credential...",
    connection_id: issuer.connection_id,
    auto_remove: false,
    credential_preview: {
      "@type": "issue-credential/2.0/credential-preview",
      attributes: [
        { name: "token", value: issuer.token }, // Only include the token attribute
      ],
    },
    filter: {
      indy: {
        cred_def_id: issuer.cred_def_id,
        revealed: true,
      },
    },
    ld_proof: {
      credential: {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          context["https://www.w3.org/2018/credentials/v1"], // Dynamic context for token
        ],
        credentialSubject: credentialSubject, // Dynamic credentialSubject with token
        description: "Credential for token.",
        identifier: "{{identifier}}",
        issuanceDate: "{{issuance_date}}",
        issuer: issuer.issuer_did,
        name: "Token Credential",
        type: ["VerifiableCredential", "TokenCredential"],
      },
      options: {
        proofType: "Ed25519Signature2018",
      },
    },
  };

  return payload;
}

export const generateCredentialPayload = ({
  connection_id,
  token,
  issuer_did,
  cred_def_id,
}) => ({
  comment: "Token Credential for Signup",
  connection_id,
  credential_preview: {
    "@type": "issue-credential/2.0/credential-preview",
    attributes: [{ name: "token", value: token }],
  },
  filter: {
    indy: { cred_def_id, issuer_did },
  },
});

export const getCredentialID = async () => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_HOLDER_ENDPOINT}/present-proof-2.0/records`
  );
  console.log("response from get credential id", response.data);
  const credential_id = response.data.results[0].pres_ex_id;
  return credential_id;
};
export const getRequestCredential = async (pres_ex_id) => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_HOLDER_ENDPOINT}/present-proof-2.0/records/${pres_ex_id}/credentials`
  );
  const data = response.data;
  console.log("response from get request credential", data);

  const cred = data.map((item) => {
    console.log(
      "response from get request credential",
      item?.cred_info?.attrs?.token
    );
    return item?.cred_info?.attrs?.token;
  });
  return cred;
};

export const deleteCredentialRequest = async (pres_ex_id) => {
  const response = await axios.delete(
    `${process.env.NEXT_PUBLIC_HOLDER_ENDPOINT}/present-proof-2.0/records/${pres_ex_id}`
  );
  console.log("response from delete credential request", response.data);
  return response.data;
};
export const convertToNormalDate = (isoTimestamp) => {
  const date = new Date(isoTimestamp);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Asia/Kolkata", // Specify the time zone for IST
  };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  return `${formattedDate}`;
};
