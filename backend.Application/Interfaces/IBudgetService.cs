using backend.Application.DTOs;
namespace backend.Application.Interfaces;

public interface IBudgetService
{
    Task<IEnumerable<BudgetDto>> GetAllBudgetsAsync();
    Task<IEnumerable<BudgetDto>> GetBudgetsByUserIdAsync(int userId);
    Task<BudgetDto?> GetBudgetByIdAsync(Guid id, int userId);
    Task<BudgetDto> GetBudgetSummaryAsync(int userId);
    Task<BudgetDto> CreateBudgetAsync(BudgetDto budgetDto, int userId);
    Task<bool> UpdateBudgetAsync(Guid id, BudgetDto budgetDto, int userId);
    Task<bool> MarkBudgetAsSpentAsync(Guid id, int userId);
    Task<bool> DeleteBudgetAsync(Guid id, int userId);
}
