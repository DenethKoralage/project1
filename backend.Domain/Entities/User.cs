namespace backend.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public int AVGIncome { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Expense> Expenses { get; set; } = new List<Expense>();
    public List<Budget> Budgets { get; set; } = new List<Budget>();
    public List<Income> Incomes { get; set; } = new List<Income>();

}
