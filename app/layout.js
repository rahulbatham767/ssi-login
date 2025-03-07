import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import HomePage from "./component/Navbar_h";
import { Toaster } from "react-hot-toast";
export const metadata = {
  title: "SSI LOGIN",
  description: "Welcome to the Beginning of Self Sovereign Identity",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en  ">
      <body className="min-h-screen overflow-auto">
     
        <HomePage />
        <Toaster position="top-right" />
        {children}</body>
    </html>
  );
}
