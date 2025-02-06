"use client";
import React, { useEffect, useState } from "react";
import { useQRCode } from "next-qrcode";
import useVerifierStore from "../store/verifierStore";

const LoginPage = () => {
  const [isCopied, setIsCopied] = useState(false);

  const { SVG } = useQRCode();

  const { userInvitation, createInvitation, Invitation, connect } =
    useVerifierStore();
  const handleCopyToClipboard = () => {
    const invitationLink = JSON.stringify(Invitation.invitation); // Serialize the invitation
    navigator.clipboard.writeText(invitationLink);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000); // Reset the copied state after 2 seconds
  };
  console.log(Invitation);
  useEffect(() => {
    connect(process.env.NEXT_PUBLIC_VERIFIER_SOCKET, "verifier");
  }, []);
  useEffect(() => {
    if (!Invitation || Object.keys(Invitation).length === 0) {
      createInvitation(); // Create an invitation if not available
    }
  }, [Invitation, createInvitation]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Scan The QR Code to Login
        </h1>

        <div className="flex justify-center mb-4">
          {Invitation?.invitation_url ? (
            <SVG
              text={JSON.stringify(Invitation.invitation_url)} // Make sure it's a valid string
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
