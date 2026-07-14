import { NextResponse } from "next/server";

// Mock user database - in a real app, this would be a database
let users = [
  {
    Id: 1,
    Name: "John Doe",
    Email: "john.doe@example.com",
    Password: "password123", // In real app, this would be hashed
    Designation: "Senior Software Engineer",
    Workplace: "Tech Corp",
    HomeAddress: "123 Tech Street",
    HomeCity: "San Francisco",
    Country: "United States",
    CreatedAt: "2023-01-15T08:30:00Z",
    UpdatedAt: "2026-07-13T09:15:00Z",
    Incomes: [],
    Expenses: [],
    Budgets: [],
    Currency: "USD",
    lastLogin: "2026-07-13T09:15:00Z",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Passionate software engineer with expertise in full-stack development, specializing in modern JavaScript frameworks and cloud-native applications. Passionate about building scalable solutions and mentoring junior developers.",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker"],
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
      portfolio: "https://johndoe.dev"
    }
  }
];
let incomes = [];

// Helper function to find user by email
const findUserByEmail = (email) => {
  return users.find(user => user.Email.toLowerCase() === email.toLowerCase());
};

// Helper function to generate a simple token (in real app, use JWT)
const generateToken = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export async function POST(request) {
  try {
    const { Name, Email, Password, Designation, Workplace, HomeAddress, HomeCity, Country, IncomeAmount, Currency } = await request.json();
    const path = new URL(request.url).pathname;
    
    if (path.includes("signup")) {
      // Handle signup - validate all required fields
      if (!Name || !Email || !Password || !Designation || !Workplace || 
          !HomeAddress || !HomeCity || !Country || !IncomeAmount || Number(IncomeAmount) <= 0 || !Currency) {
        return NextResponse.json(
          { error: "Please provide all required signup fields." },
          { status: 400 }
        );
      }

      // Check if user already exists
      const existingUser = findUserByEmail(Email);
      if (existingUser) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 400 }
        );
      }

      // Create new user with backend UserDto structure (all properties)
      const newUser = {
        Id: users.length + 1,
        Name: Name,
        Email: Email,
        Password: Password, // In real app, hash this!
        Designation: Designation,
        Workplace: Workplace,
        HomeAddress: HomeAddress,
        HomeCity: HomeCity,
        Country: Country,
        CreatedAt: new Date().toISOString(),
        UpdatedAt: new Date().toISOString(),
        Incomes: [],
        Expenses: [],
        Budgets: [],
        Currency: Currency,
        lastLogin: new Date().toISOString(),
        profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", // Default avatar
        bio: "",
        skills: [],
        socialLinks: {
          github: "",
          linkedin: "",
          twitter: "",
          portfolio: ""
        }
      };

      users.push(newUser);

      incomes.push({
        Id: crypto.randomUUID(),
        Amount: Number(IncomeAmount),
        Source: "Monthly income",
        Category: "Salary",
        IncomeDate: new Date().toISOString(),
        Description: "Initial income recorded during registration.",
        UserId: newUser.Id,
      });

      newUser.Incomes = incomes.filter((income) => income.UserId === newUser.Id);

      // Return user (without password) and token - matching UserDto structure exactly
      const { Password: _, ...userWithoutPassword } = newUser;
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        token: generateToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
    } else if (path.includes("login")) {
      // Handle login
      if (!Email || !Password) {
        return NextResponse.json(
          { error: "Please provide email and password" },
          { status: 400 }
        );
      }

      const user = findUserByEmail(Email);
      if (!user || user.Password !== Password) { // In real app, compare hashed password
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Update last login
      user.lastLogin = new Date().toISOString();

      // Return user (without password) and token
      const { Password: _, ...userWithoutPassword } = user;
      return NextResponse.json({
        success: true,
        user: userWithoutPassword,
        token: generateToken(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
    } else {
      return NextResponse.json(
        { error: "Invalid endpoint" },
        { status: 404 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
