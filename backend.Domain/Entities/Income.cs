namespace backend.Domain.Entities;

public class Income
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; } = 0;
    public string Category { get; set; } = "Salary";
    public string Source { get; set; } = "Monthly income";
    public DateTime IncomeDate { get; set; }
    public string Description { get; set; } = "Initial income recorded during registration.";
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public static Income Create(
        int userId,
        decimal amount,
        string source,
        string category,
        DateTime incomeDate,
        string description)
    {
        var income = new Income
        {
            Id = Guid.NewGuid(),
            UserId = userId
        };

        income.UpdateDetails(amount, source, category, incomeDate, description);
        return income;
    }

    public void UpdateDetails(
        decimal amount,
        string source,
        string category,
        DateTime incomeDate,
        string description)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Income amount must be greater than zero.", nameof(amount));
        }

        if (string.IsNullOrWhiteSpace(source))
        {
            throw new ArgumentException("Income source is required.", nameof(source));
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            throw new ArgumentException("Income category is required.", nameof(category));
        }

        Amount = amount;
        Source = source.Trim();
        Category = category.Trim();
        IncomeDate = incomeDate;
        Description = description.Trim();
    }
}
