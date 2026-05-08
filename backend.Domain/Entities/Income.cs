namespace backend.Domain.Entities;

public class Income
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; } = 0;
    public string Source { get; set; } = string.Empty;
    public DateTime IncomeDate { get; set; }
    public string Description { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
