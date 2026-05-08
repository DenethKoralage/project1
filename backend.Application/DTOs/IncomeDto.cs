namespace backend.Application.DTOs;

public class IncomeDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; } = 0;
    public string Source { get; set; } = string.Empty;
    public DateTime IncomeDate { get; set; }
    public string Description { get; set; } = string.Empty;
}