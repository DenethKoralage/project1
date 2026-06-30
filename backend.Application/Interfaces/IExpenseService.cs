using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface IExpenseService
{
    Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync();
    Task<ExpenseDto?> GetExpenseByIdAsync(Guid id, int userId);
    Task<ExpenseDto> CreateExpenseAsync(ExpenseDto expenseDto, int userId);
    Task<bool> UpdateExpenseAsync(Guid id, ExpenseDto expenseDto, int userId);
    Task<bool> DeleteExpenseAsync(Guid id, int userId);
    Task<IEnumerable<ExpenseDto>> GetExpensesByUserIdAsync(int userId);
    Task<ExpenseDto> GetExpensesCountAsync(int userId);
    Task<int> GetExpensesCountAsync();
    Task<decimal> GetTotalExpensesByUserIdAsync(int userId);
    Task<decimal> GetTotalExpensesByUserIdAndMonthAsync(int userId, int month);
    Task<decimal> GetTotalExpensesByUserIdAndCategoryAndMonthAsync(int userId, string category, int month);
    Task<decimal> GetTotalExpensesByUserIdAndCategoryAndYearAsync(int userId, string category, int year);
    Task<decimal> GetTotalExpensesByUserIdAndCategoryAsync(int userId, string category);
    Task<decimal> GetTotalExpensesByUserIdAndYearAsync(int userId, int year);
    Task<IEnumerable<ExpenseDto>> GetAllExpensesByUserIdAsync(int userId);
}