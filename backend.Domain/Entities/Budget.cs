namespace backend.Domain.Entities;

public class Budget
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal TotalBudget { get; set; }
    public decimal RemainingBudget { get; set; }
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public static Budget Create(
        int userId,
        string name,
        decimal amount,
        string title,
        string category,
        DateTime startDate,
        DateTime endDate,
        string description,
        decimal? remainingBudget = null)
    {
        var budget = new Budget
        {
            Id = Guid.NewGuid(),
            UserId = userId
        };

        budget.UpdateDetails(name, amount, title, category, startDate, endDate, description, remainingBudget);
        return budget;
    }

    public void UpdateDetails(
        string name,
        decimal amount,
        string title,
        string category,
        DateTime startDate,
        DateTime endDate,
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

        if (endDate < startDate)
        {
            throw new ArgumentException("Budget end date cannot be earlier than start date.", nameof(endDate));
        }

        Name = name.Trim();
        Amount = amount;
        Title = string.IsNullOrWhiteSpace(title) ? Name : title.Trim();
        Category = category.Trim();
        StartDate = startDate;
        EndDate = endDate;
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
        var currentDate = date.Date;
        return currentDate >= StartDate.Date && currentDate <= EndDate.Date;
    }
}
