namespace backend.Application.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Workplace { get; set; } = string.Empty;
    public string HomeAddress { get; set; } = string.Empty;
    public string HomeCity { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<IncomeDto> Incomes { get; internal set; } = new List<IncomeDto>();
    public List<ExpenseDto> Expenses { get; internal set; } = new List<ExpenseDto>();
    public List<BudgetDto> Budgets { get; internal set; } = new List<BudgetDto>();
}
