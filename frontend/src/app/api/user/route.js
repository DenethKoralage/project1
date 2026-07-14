import { NextResponse } from "next/server";

// Mock user profile store - mirrors the backend UserDto (PascalCase).
// In production this would be a GET/PUT to your .NET API (e.g. /api/user or /api/account).
let currentUser = {
  Id: 1,
  Name: "John Doe",
  Email: "john.doe@example.com",
  Designation: "Senior Software Engineer",
  Workplace: "Tech Corp",
  HomeAddress: "123 Tech Street",
  HomeCity: "San Francisco",
  Country: "United States",
  AVGIncome: 7500,
  CreatedAt: "2023-01-15T08:30:00Z",
  UpdatedAt: "2026-07-13T09:15:00Z",
  Incomes: [],
  Expenses: [],
  Budgets: [],
  // Extra fields kept for UI convenience (not part of the strict DTO):
  Currency: "USD",
  bio: "Passionate software engineer with expertise in full-stack development, specializing in modern JavaScript frameworks and cloud-native applications.",
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker"],
  socialLinks: {
    github: "https://github.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    portfolio: "https://johndoe.dev",
  },
};

export async function GET() {
  return NextResponse.json({ success: true, user: currentUser });
}

export async function PUT(request) {
  try {
    const body = await request.json();

    // Update only the fields the client is allowed to change, keeping the
    // PascalCase shape expected by the backend UserDto.
    currentUser = {
      ...currentUser,
      Name: body.Name ?? currentUser.Name,
      Email: body.Email ?? currentUser.Email,
      Designation: body.Designation ?? currentUser.Designation,
      Workplace: body.Workplace ?? currentUser.Workplace,
      HomeAddress: body.HomeAddress ?? currentUser.HomeAddress,
      HomeCity: body.HomeCity ?? currentUser.HomeCity,
      Country: body.Country ?? currentUser.Country,
      Currency: body.Currency ?? currentUser.Currency,
      AVGIncome:
        body.AVGIncome !== undefined
          ? Number(body.AVGIncome)
          : currentUser.AVGIncome,
      bio: body.bio ?? currentUser.bio,
      skills: body.skills ?? currentUser.skills,
      socialLinks: { ...currentUser.socialLinks, ...(body.socialLinks ?? {}) },
      UpdatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      user: currentUser,
      message: "Profile updated successfully",
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
