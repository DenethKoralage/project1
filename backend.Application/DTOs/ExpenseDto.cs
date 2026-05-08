namespace backend.Application.DTOs;

public class ExpenseDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Category { get; set; } = string.Empty;
    public DateTime ExpenseDate { get; set; }
    public string Description { get; set; } = string.Empty;
}
