"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import useVerifierStore from "../store/verifierStore";
import { generateJwtToken } from "../utils/template";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    email: "",
    phone: "",
    organization: "",
    address: "",
  });

  const [loading, setLoading] = useState(false);
  const {
    registerReq,
    invitation,
    issuerRecInvitation,
    setToken,
    connectWebSocket,
  } = useVerifierStore();

  // ✅ Handle input change dynamically
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!invitation?.invitation) {
      console.error("❌ No invitation available");
      setLoading(false);
      return;
    }
    const token = await generateJwtToken(formData);
    if (!token) {
      console.error("❌ Failed to generate token");
      setLoading(false);
      return;
    }
    console.log("🔑 Token generated:", token);

    issuerRecInvitation(invitation.invitation);
    setToken(token);
    setLoading(false);
  };

  useEffect(() => {
    if (!invitation || Object.keys(invitation).length === 0) {
      registerReq();
    }
  }, [invitation, registerReq]);
  useEffect(() => {
    connectWebSocket(process.env.NEXT_PUBLIC_HOLDER_SOCKET, "holder");
    connectWebSocket(process.env.NEXT_PUBLIC_ISSUER_SOCKET, "issuer");
    connectWebSocket(process.env.NEXT_PUBLIC_VERIFIER_SOCKET, "verifier");
  }, []);
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">
          SSI Account Sign-Up
        </h2>
        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-gray-600 font-semibold">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              required
            />
          </div>

          {/* DOB */}
          <div>
            <label htmlFor="dob" className="block text-gray-600 font-semibold">
              Date of Birth
            </label>
            <input
              id="dob"
              name="dob"
              type="date"
              value={formData.dob}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-gray-600 font-semibold"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john.doe@example.com"
              required
            />
          </div>

          {/* Phone No. */}
          <div>
            <label
              htmlFor="phone"
              className="block text-gray-600 font-semibold"
            >
              Phone No.
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+91 9876543210"
              required
            />
          </div>

          {/* Organization */}
          <div>
            <label
              htmlFor="organization"
              className="block text-gray-600 font-semibold"
            >
              Organization
            </label>
            <input
              id="organization"
              name="organization"
              type="text"
              value={formData.organization}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="XYZ Pvt. Ltd."
            />
          </div>

          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="block text-gray-600 font-semibold"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123, Street, City, Country"
              rows="3"
            />
          </div>

          {/* Invitation Link */}
          <div>
            <label
              htmlFor="invitationLink"
              className="block text-gray-600 font-semibold"
            >
              Invitation Link
            </label>
            <input
              id="invitationLink"
              type="text"
              value={
                invitation?.invitation
                  ? JSON.stringify(invitation.invitation)
                  : "Generating invitation..."
              }
              className="w-full p-3 border-2 border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
              readOnly
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300"
            disabled={loading || !invitation?.invitation}
          >
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>

        {/* Already have an account */}
        <p className="mt-4 text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
