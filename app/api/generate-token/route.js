import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const { name, email } = await req.json();

    const secret = process.env.NEXT_PUBLIC_JWT_SECRET_KEY;
    if (!secret) {
      return new Response(JSON.stringify({ error: "JWT Secret is missing!" }), {
        status: 500,
      });
    }

    const payload = {
      name,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() + 100 / 1000) + 10 * 24 * 60 * 60, // 1 hour expiry
    };

    const token = jwt.sign(payload, secret, { algorithm: "HS256" });

    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Error generating token" }), {
      status: 500,
    });
  }
}
