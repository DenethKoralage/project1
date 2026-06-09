using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface IIncomeService
{
    Task<IEnumerable<IncomeDto>> GetAllIncomesAsync();
    Task<IncomeDto?> GetIncomeByIdAsync(Guid id, int userId);
    Task<IncomeDto> CreateIncomeAsync(IncomeDto incomeDto, int userId);
    Task<bool> UpdateIncomeAsync(Guid id, IncomeDto incomeDto, int userId);
    Task<bool> DeleteIncomeAsync(Guid id, int userId);
    Task<IEnumerable<IncomeDto>> GetIncomesByUserIdAsync(int userId);
    Task<IncomeDto> GetIncomesCountAsync(int userId);
    Task<int> GetIncomesCountAsync();
    Task<decimal> GetTotalIncomesByUserIdAsync(int userId);
    Task<decimal> GetTotalIncomesByUserIdAndMonthAsync(int userId, int month);
    Task<decimal> GetTotalIncomesByUserIdAndCategoryAndMonthAsync(int userId, string category, int month);
    Task<decimal> GetTotalIncomesByUserIdAndCategoryAndYearAsync(int userId, string category, int year);
    Task<decimal> GetTotalIncomesByUserIdAndCategoryAsync(int userId, string category);
    Task<decimal> GetTotalIncomesByUserIdAndYearAsync(int userId, int year);
}