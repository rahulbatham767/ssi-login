import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token missing" }, { status: 400 });
    }

    const response = NextResponse.json({ message: "Token set successfully" });

    response.headers.append(
      "Set-Cookie",
      `userToken=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${10 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    return NextResponse.json({ error: "Failed to set cookie" }, { status: 500 });
  }
}
export async function GET() {
    const response = NextResponse.json({ message: "Logged out successfully" });
  
    // Clear the userToken cookie by setting Max-Age=0
    response.headers.append(
      "Set-Cookie",
      "userToken=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0"
    );
  
    return response;
  }