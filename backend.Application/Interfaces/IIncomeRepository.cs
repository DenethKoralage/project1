using backend.Domain.Entities;

namespace backend.Application.Interfaces;

public interface IIncomeRepository
{
    Task<IEnumerable<Income>> GetAllIncomesAsync();
    Task<Income?> GetIncomeByIdAsync(int id);
    Task<Income> CreateIncomeAsync(Income income);
    Task UpdateIncomeAsync(Income income);
    Task DeleteIncomeAsync(int id);
    Task<IEnumerable<Income>> GetIncomesByUserIdAsync(int userId);
    Task<int> GetIncomesCountAsync();
}