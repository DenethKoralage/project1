namespace backend.Application.DTOs;

public class UserDto
{
    public int Id { get; set; }
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(120, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.EmailAddress]
    [System.ComponentModel.DataAnnotations.StringLength(256)]
    public string Email { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.MinLength(8)]
    [System.ComponentModel.DataAnnotations.StringLength(100)]
    public string Password { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(120)]
    public string Designation { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(120)]
    public string Workplace { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(256)]
    public string HomeAddress { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(120)]
    public string HomeCity { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(120)]
    public string Country { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(10)]
    public string Currency { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal? IncomeAmount { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<IncomeDto> Incomes { get; set; } = new List<IncomeDto>();
    public List<ExpenseDto> Expenses { get; set; } = new List<ExpenseDto>();
    public List<BudgetDto> Budgets { get; set; } = new List<BudgetDto>();
}
