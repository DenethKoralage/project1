let currentUser = {
  Id: 1,
  Name: "John Doe",
  Email: "john.doe@example.com",
  Designation: "Senior Software Engineer",
  Workplace: "Tech Corp",
  HomeAddress: "123 Tech Street",
  HomeCity: "San Francisco",
  Country: "United States",
  Currency: "USD",
  IncomeAmount: 7500,
  CreatedAt: "2023-01-15T08:30:00Z",
  UpdatedAt: "2026-07-13T09:15:00Z",
  Incomes: [],
  Expenses: [],
  Budgets: [],
  bio: "Passionate software engineer with expertise in full-stack development, specializing in modern JavaScript frameworks and cloud-native applications.",
  skills: ["JavaScript", "TypeScript", "React", "Node.js", "Python", "AWS", "Docker"],
  socialLinks: {
    github: "https://github.com/johndoe",
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    portfolio: "https://johndoe.dev",
  },
};

export function getUsers() {
  return [currentUser];
}

export function getUserById(id) {
  return Number(id) === currentUser.Id ? currentUser : null;
}

export function updateUser(id, body) {
  if (Number(id) !== currentUser.Id) {
    return null;
  }

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
    IncomeAmount:
      body.IncomeAmount !== undefined
        ? Number(body.IncomeAmount)
        : currentUser.IncomeAmount,
    bio: body.bio ?? currentUser.bio,
    skills: body.skills ?? currentUser.skills,
    socialLinks: { ...currentUser.socialLinks, ...(body.socialLinks ?? {}) },
    UpdatedAt: new Date().toISOString(),
  };

  return currentUser;
}
