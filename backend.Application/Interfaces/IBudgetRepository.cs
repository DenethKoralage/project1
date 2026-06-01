using backend.Domain.Entities;

namespace backend.Application.Interfaces;

public interface IBudgetRepository
{
    Task<IEnumerable<Budget>> GetAllBudgetsAsync();
    Task<IEnumerable<Budget>> GetBudgetsByUserIdAsync(int userId);
    Task<Budget?> GetBudgetByIdAsync(Guid id);
    Task<decimal> GetTotalBudgetAsync(int userId);
    Task<decimal> GetRemainingBudgetAsync(int userId);
    Task<Budget> CreateBudgetAsync(Budget budget);
    Task UpdateBudgetAsync(Budget budget);
    Task DeleteBudgetAsync(Guid id);
}
