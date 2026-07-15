import { NextResponse } from "next/server";
import { createAuthResponse, createUser, findUserByEmail } from "../authStore";

export async function POST(request) {
  try {
    const payload = await request.json();
    const {
      Name,
      Email,
      Password,
      Designation,
      Workplace,
      HomeAddress,
      HomeCity,
      Country,
      IncomeAmount,
      Currency,
    } = payload;

    if (
      !Name ||
      !Email ||
      !Password ||
      !Designation ||
      !Workplace ||
      !HomeAddress ||
      !HomeCity ||
      !Country ||
      !IncomeAmount ||
      Number(IncomeAmount) <= 0 ||
      !Currency
    ) {
      return NextResponse.json(
        { error: "Please provide all required signup fields." },
        { status: 400 }
      );
    }

    if (findUserByEmail(Email)) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    const user = createUser(payload);

    return NextResponse.json(createAuthResponse(user));
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
