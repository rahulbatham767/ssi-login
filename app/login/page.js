"use client";
import React, { useEffect, useState } from "react";
import { useQRCode } from "next-qrcode";
import useVerifierStore from "../store/verifierStore";
import toast from "react-hot-toast";
import { checkCredential } from "../utils/apiCall";

const LoginPage = () => {
  const [isCopied, setIsCopied] = useState(false);

  const { SVG } = useQRCode();

  const { VerifierReq, invitation, connectWebSocket } = useVerifierStore();
  const handleCopyToClipboard = () => {
    if (!invitation || !invitation.invitation) {
      toast.error("Link is not generated yet!", { duration: 4000 });
      return;
    }

    const invitationLink = JSON.stringify(invitation.invitation); // Serialize the invitation
    navigator.clipboard
      .writeText(invitationLink)
      .then(() => {
        setIsCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000); // Reset copied state after 2 seconds
      })
      .catch((error) => {
        console.error("Clipboard Copy Failed:", error);
        toast.error("Failed to copy link.");
      });
  };
  console.log(invitation);
  useEffect(() => {
    connectWebSocket(process.env.NEXT_PUBLIC_VERIFIER_SOCKET, "verifier");
    connectWebSocket(process.env.NEXT_PUBLIC_HOLDER_SOCKET, "holder");
  }, []);
  useEffect(() => {
    if (!invitation || Object.keys(invitation).length === 0) {
      VerifierReq(); // Create an invitation if not available
    }
  }, [invitation, VerifierReq]);

  checkCredential();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Scan The QR Code to Login
        </h1>

        <div className="flex justify-center mb-4">
          {invitation?.invitation_url ? (
            <SVG
              text={JSON.stringify(invitation.invitation_url)} // Make sure it's a valid string
              options={{
                margin: 2,
                width: 200,
                color: {
                  dark: "#010599FF",
                  light: "#FFBF60FF",
                },
              }}
            />
          ) : (
            <p>Loading...</p> // Fallback while loading the invitation URL
          )}
        </div>
        <p className="text-gray-600 mb-4 text-center">Or</p>
        <button
          onClick={handleCopyToClipboard}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <span className="material-icons"></span>
          {isCopied ? "Copied!" : "Copy Login Link"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
