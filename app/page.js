"use client";
import { useEffect } from "react";
import useVerifierStore from "./store/verifierStore";
import HomePage from "./component/Navbar_h";

export default function Home() {
  const { connect } = useVerifierStore();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main>
        <HomePage />
      </main>
    </div>
  );
}
