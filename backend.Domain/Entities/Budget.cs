namespace backend.Domain.Entities;

public class Budget
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime ExpectedDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal TotalBudget { get; set; }
    public decimal RemainingBudget { get; set; }
    public bool IsSpent { get; set; }
    public DateTime? SpentAt { get; set; }
    public Guid? ExpenseId { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public static Budget Create(
        int userId,
        string name,
        decimal amount,
        string title,
        string category,
        DateTime expectedDate,
        string description,
        decimal? remainingBudget = null)
    {
        var budget = new Budget
        {
            Id = Guid.NewGuid(),
            UserId = userId
        };

        budget.UpdateDetails(name, amount, title, category, expectedDate, description, remainingBudget);
        return budget;
    }

    public void UpdateDetails(
        string name,
        decimal amount,
        string title,
        string category,
        DateTime expectedDate,
        string description,
        decimal? remainingBudget = null)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Budget amount must be greater than zero.", nameof(amount));
        }

        if (string.IsNullOrWhiteSpace(name))
        {
            throw new ArgumentException("Budget name is required.", nameof(name));
        }

        if (string.IsNullOrWhiteSpace(category))
        {
            throw new ArgumentException("Budget category is required.", nameof(category));
        }

        if (expectedDate < DateTime.UtcNow.Date)
        {
            throw new ArgumentException("Budget expected date cannot be in the past.", nameof(expectedDate));
        }

        Name = name.Trim();
        Amount = amount;
        Title = string.IsNullOrWhiteSpace(title) ? Name : title.Trim();
        Category = category.Trim();
        ExpectedDate = expectedDate;
        Description = description.Trim();
        TotalBudget = amount;
        RemainingBudget = remainingBudget ?? amount;

        if (RemainingBudget < 0)
        {
            throw new ArgumentException("Remaining budget cannot be negative.", nameof(remainingBudget));
        }

        if (RemainingBudget > TotalBudget)
        {
            throw new ArgumentException("Remaining budget cannot exceed total budget.", nameof(remainingBudget));
        }
    }

    public void Spend(decimal amount)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Spend amount must be greater than zero.", nameof(amount));
        }

        if (amount > RemainingBudget)
        {
            throw new InvalidOperationException("Spend amount cannot exceed remaining budget.");
        }

        RemainingBudget -= amount;
    }

    public void Restore(decimal amount)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Restore amount must be greater than zero.", nameof(amount));
        }

        if (RemainingBudget + amount > TotalBudget)
        {
            throw new InvalidOperationException("Remaining budget cannot exceed total budget.");
        }

        RemainingBudget += amount;
    }

    public bool IsActive(DateTime date)
    {
        return date.Date == ExpectedDate.Date;
    }

    public void MarkAsSpent(Guid expenseId, DateTime spentAt)
    {
        if (IsSpent)
        {
            throw new InvalidOperationException("Budget allocation is already spent.");
        }

        RemainingBudget = 0;
        IsSpent = true;
        SpentAt = spentAt;
        ExpenseId = expenseId;
    }
}
