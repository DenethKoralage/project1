namespace backend.Domain.Entities;

public class Expense
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; } = 0;
    public string Category { get; set; } = string.Empty;
    public DateTime ExpenseDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public static Expense Create(
        int userId,
        decimal amount,
        string category,
        DateTime expenseDate,
        string description)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Expense amount must be greater than zero.", nameof(amount));
        }
        if (string.IsNullOrWhiteSpace(category))
        {
            throw new ArgumentException("Expense category is required.", nameof(category));
        }
        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = amount,
            Category = category.Trim(),
            ExpenseDate = expenseDate,
            Description = description.Trim()
        };
        return expense;
    }


    public void UpdateDetails(
        decimal amount,
        string category,
        DateTime expenseDate,
        string description)
    {
        if (amount <= 0)
        {
            throw new ArgumentException("Expense amount must be greater than zero.", nameof(amount));
        }
        if (string.IsNullOrWhiteSpace(category))
        {
            throw new ArgumentException("Expense category is required.", nameof(category));
        }
        Amount = amount;
        Category = category.Trim();
        ExpenseDate = expenseDate;
        Description = description.Trim();
    }

}
