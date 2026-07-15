import { NextResponse } from "next/server";
import { createAuthResponse, findUserByEmail } from "../authStore";

export async function POST(request) {
  try {
    const { Email, Password } = await request.json();

    if (!Email || !Password) {
      return NextResponse.json(
        { error: "Please provide email and password" },
        { status: 400 }
      );
    }

    const user = findUserByEmail(Email);

    if (!user || user.Password !== Password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    user.lastLogin = new Date().toISOString();

    return NextResponse.json(createAuthResponse(user));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
