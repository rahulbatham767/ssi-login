// export function Token_Credential_Request(proof) {
//   const data = {
//     auto_present: true,
//     auto_remove: true,
//     comment: "request for token verification...",
//     connection_id: proof.connection_id,
//     presentation_request: {
//       indy: {
//         name: "Proof request",
//         non_revoked: {
//           from: 1640995199,
//           to: 1640995199,
//         },
//         nonce: "1",
//         requested_attributes: {
//           token: {
//             name: "token",
//             names: ["token"],
//             non_revoked: {
//               from: 1640995199,
//               to: 1640995199,
//             },
//             restrictions: [
//               {
//                 token: "5dyaWPcQ5RoddcHH2dpmYE:3:CL:13:token",
//               },
//             ],
//           },
//         },
//         requested_predicates: {},
//         version: "1.0",
//       },
//     },

//     trace: false,
//   };

//   return data;
// }

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

export async function generateJwtToken(user) {
  try {
    const response = await axios.post("/api/generate-token", {
      name: user.name,
      email: user.email,
    });

    console.log("Generated token:", response.data.token);
    return response.data.token; // ✅ Properly returns token
  } catch (error) {
    console.error(
      "Error generating JWT token:",
      error.response?.data || error.message
    );
    return null; // ✅ Ensures function still returns something
  }
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
    indy: { cred_def_id },
  },
});
