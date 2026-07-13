namespace backend.Application.DTOs;

public class BudgetDto
{
    public Guid Id { get; set; }
    public int UserId { get; set; }
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(120)]
    public string Name { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal Amount { get; set; }
    public string Title { get; set; } = string.Empty;
    [System.ComponentModel.DataAnnotations.Required]
    [System.ComponentModel.DataAnnotations.StringLength(120)]
    public string Category { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    [System.ComponentModel.DataAnnotations.StringLength(512)]
    public string Description { get; set; } = string.Empty;
    public decimal TotalBudget { get; set; }
    public decimal RemainingBudget { get; set; }
}
