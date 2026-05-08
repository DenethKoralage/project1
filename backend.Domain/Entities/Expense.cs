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
}