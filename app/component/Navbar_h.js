"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import axios from "axios";
import userStore from "../store/userStore";

export default function HomePage() {
  const router = useRouter();
  const storedUser =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("UserDetails") || "{}")
      : {};

  const [displayedText, setDisplayedText] = useState("");
  const { isLoggedIn } = userStore();
  // Function to capitalize the first letter of a string
  const capitalizeFirstLetter = (str) => {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  };

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

  const handleLogout = () => {
    axios.get("api/set-token");
    localStorage.removeItem("Token");
    localStorage.removeItem("UserDetails"); // Clear user data
    window.location.href = "/login"; // Redirect to login page
  };

  return (
    <div className="flex flex-col bg-gray-50">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 bg-blue-400 text-white shadow-md">
        <h1
          className="text-xl font-bold cursor-pointer"
          onClick={() => router.push("/")}
        >
          Self-Sovereign Identity
        </h1>
        {isLoggedIn && (
          <div className="space-x-10 mr-12">
            <Link href="/" className="hover:text-gray-200">
              Home
            </Link>
            <Link href="/credentials" className="hover:text-gray-200">
              Credentials
            </Link>
            <Link href="/connections" className="hover:text-gray-200">
              Connections
            </Link>
            <Link href="/settings" className="hover:text-gray-200">
              Settings
            </Link>
          </div>
        )}
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600"
          >
            Logout
          </button>
        ) : (
          <div>
            <button
              onClick={() => router.push("/signup")}
              className="bg-blue-500 text-white px-4 mr-2 py-2 rounded-lg hover:bg-blue-600"
            >
              Sign Up
            </button>
            <button
              onClick={() => router.push("/login")}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        )}
      </nav>
      ){/* Main Content */}
    </div>
  );
}
