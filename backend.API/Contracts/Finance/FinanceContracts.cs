using System.ComponentModel.DataAnnotations;

namespace backend.API.Contracts.Finance;

public class AddExpenseRequest
{
    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than zero.")]
    public decimal Amount { get; set; }

    public string? Description { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public string? Category { get; set; }
}