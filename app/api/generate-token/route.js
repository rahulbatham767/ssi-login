import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongodb";
import Credential from "@/models/Credential";

export async function POST(req) {
  try {
    await connectDB(); // Connect to MongoDB

    const { name, email, dob, phone, organization, address } = await req.json();

    const secret = process.env.NEXT_PUBLIC_JWT_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ error: "JWT Secret is missing!" }), { status: 500 });
    }

    // Generate Credential Issue Date & Credential No.
    const credentialIssueDate = new Date().toISOString();
    const credentialNo = `CRED-${Math.floor(100000 + Math.random() * 900000)}`;

    const payload = {
      name,
      email,
      dob,
      phone,
      organization,
      address,
      credentialIssueDate,
      credentialNo,
    };

    // JWT Token Payload (Only necessary fields)
    const usertoken = {
      name,
      email,
      dob,
      credentialIssueDate,
      credentialNo,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60, // 10 days expiry
    };

    const token = jwt.sign(usertoken, secret, { algorithm: "HS256" });

    // Save to MongoDB
    console.log("Saving credential to MongoDB...",payload,token);
    
    const newCredential = new Credential({ ...payload, token });
    await newCredential.save();
console.log("token to send is",token);

    return new Response(JSON.stringify({ token, message: "Credential stored successfully!" }), { status: 200 });
  } catch (error) {
    console.error("❌ Error storing credential:", error);
    return new Response(JSON.stringify({ error: "Error generating token" }), { status: 500 });
  }
}
