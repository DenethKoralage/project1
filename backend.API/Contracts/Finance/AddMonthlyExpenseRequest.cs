namespace backend.API.Contracts.Finance;

public class AddMonthlyExpenseRequest
{
    public decimal Amount { get; set; }

    public string Description { get; set; } = string.Empty;

    public DateTime Month { get; set; }

    public string Category { get; set; } = string.Empty;
}
