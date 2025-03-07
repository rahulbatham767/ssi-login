"use client";
import { useEffect, useState } from "react";

import userStore from "./store/userStore";
import Link from "next/link";
import { motion } from "framer-motion";
import useVerifierStore from "./store/verifierStore";
import { convertToNormalDate } from "./utils/template";
export default function Home() {
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("UserDetails") || "{}") // ✅ Default to empty object
      : {};
  console.log("Parsed UserDetails:", storedUser);

  const [displayedText, setDisplayedText] = useState("");
  const { isLoggedIn } = userStore();
  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  };
  const { connectWebSocket } = useVerifierStore();
  // Typewriter Effect
  useEffect(() => {
    if (storedUser.name) {
      const capitalizedName = capitalizeFirstLetter(storedUser.name);
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(capitalizedName.substring(0, i + 1));
        i++;
        if (i >= capitalizedName.length) clearInterval(interval);
      }, 150);
      return () => clearInterval(interval);
    }
  }, [storedUser.name]);

  useEffect(() => {
    connectWebSocket(process.env.NEXT_PUBLIC_HOLDER_SOCKET, "holder");
    connectWebSocket(process.env.NEXT_PUBLIC_ISSUER_SOCKET, "issuer");
    connectWebSocket(process.env.NEXT_PUBLIC_VERIFIER_SOCKET, "verifier");
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}

      {/* Main Content */}
      <main className="flex flex-grow flex-col items-center justify-center p-6 sm:p-10">
        <div className="flex flex-grow flex-col justify-center p-6">
          {isLoggedIn ? (
            <>
              <h1 className="text-4xl font-extrabold text-gray-800 text-center">
                Welcome,{" "}
                <motion.span
                  className="text-blue-600"
                  animate={{ opacity: [0, 1] }}
                  transition={{ duration: 1 }}
                >
                  {displayedText || "User"}
                </motion.span>
              </h1>

              {/* User Information Section */}
              <div className="mt-6 bg-white p-6 rounded-lg shadow-lg w-full w-[30rem]">
                <h2 className="text-xl font-bold text-center mb-4 text-gray-700">
                  YOUR INFORMATION
                </h2>
                <div className="space-y-4 text-gray-600 text-lg">
                  <p>
                    <strong>Name:</strong>{" "}
                    {capitalizeFirstLetter(storedUser.name) || "N/A"}
                  </p>
                  <p>
                    <strong>Email:</strong> {storedUser.email || "N/A"}
                  </p>
                  <p>
                    <strong>DOB:</strong> {storedUser.dob || "N/A"}
                  </p>
                  <p>
                    <strong>Credential No:</strong>{" "}
                    {storedUser.credentialNo || "N/A"}
                  </p>
                  <p>
                    <strong>Credential Issued:</strong>{" "}
                    {convertToNormalDate(storedUser.credentialIssueDate) ||
                      "N/A"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            // Message when user is NOT logged in
            <>
              <h1 className="text-4xl font-extrabold text-gray-800">
                Welcome to{" "}
                <span className="text-blue-600">Self-Sovereign Identity</span>
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                <Link href="/login" className="text-blue-500">
                  Login
                </Link>{" "}
                to know more about it.
              </p>
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-gray-600 border-t">
        &copy; {new Date().getFullYear()} Self-Sovereign Identity. All rights
        reserved.
      </footer>
    </div>
  );
}
