import { NextResponse } from "next/server";
import { getUserById, updateUser } from "../mockStore";

export async function GET(_request, { params }) {
  const { id } = await params;
  const user = getUserById(id);

  if (!user) {
    return new NextResponse("User not found.", { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const user = updateUser(id, body);

    if (!user) {
      return new NextResponse("User not found.", { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse("Failed to update profile.", { status: 500 });
  }
}
