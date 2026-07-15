let users = [
  {
    Id: 1,
    Name: "John Doe",
    Email: "john.doe@example.com",
    Password: "password123",
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
    profilePicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Passionate software engineer with expertise in full-stack development, specializing in modern JavaScript frameworks and cloud-native applications. Passionate about building scalable solutions and mentoring junior developers.",
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "AWS",
      "Docker",
    ],
    socialLinks: {
      github: "https://github.com/johndoe",
      linkedin: "https://linkedin.com/in/johndoe",
      twitter: "https://twitter.com/johndoe",
      portfolio: "https://johndoe.dev",
    },
  },
];

let incomes = [];

export const findUserByEmail = (email) => {
  return users.find((user) => user.Email.toLowerCase() === email.toLowerCase());
};

export const createUser = ({
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
}) => {
  const newUser = {
    Id: users.length + 1,
    Name,
    Email,
    Password,
    Designation,
    Workplace,
    HomeAddress,
    HomeCity,
    Country,
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
    Incomes: [],
    Expenses: [],
    Budgets: [],
    Currency,
    lastLogin: new Date().toISOString(),
    profilePicture:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "",
    skills: [],
    socialLinks: {
      github: "",
      linkedin: "",
      twitter: "",
      portfolio: "",
    },
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

  return newUser;
};

export const generateToken = () => {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

export const createAuthResponse = (user) => {
  const { Password, ...userWithoutPassword } = user;

  return {
    success: true,
    user: userWithoutPassword,
    token: generateToken(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
};
