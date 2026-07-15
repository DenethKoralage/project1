import { NextResponse } from "next/server";
import { getUsers } from "./mockStore";

export async function GET() {
  return NextResponse.json(getUsers());
}
