namespace backend.Domain.Entities;

public class Budget
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Amount { get; set; } = 0;
    public string Category { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}