using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _expenseRepository;

    public ExpenseService(IExpenseRepository expenseRepository)
    {
        _expenseRepository = expenseRepository;
    }

    public async Task<ExpenseDto> CreateExpenseAsync(
        ExpenseDto expenseDto,
        int userId)
    {
        var expense = new Expense
        {
            Id = Guid.NewGuid(),
            Amount = expenseDto.Amount,
            Category = expenseDto.Category,
            ExpenseDate = expenseDto.ExpenseDate,
            Description = expenseDto.Description,
            UserId = userId
        };

        await _expenseRepository.CreateExpenseAsync(expense);

        expenseDto.Id = expense.Id;

        return expenseDto;
    }

    public async Task<bool> DeleteExpenseAsync(
        Guid id,
        int userId)
    {
        var expense = await _expenseRepository.GetExpenseByIdAsync(id, userId);

        if (expense == null)
            return false;

        return await _expenseRepository.DeleteExpenseAsync(id, userId);
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync()
    {
        return await _expenseRepository.GetAllExpensesAsync();
    }

    public async Task<ExpenseDto?> GetExpenseByIdAsync(
        Guid id,
        int userId)
    {
        return await _expenseRepository.GetExpenseByIdAsync(id, userId);
    }

    public async Task<IEnumerable<ExpenseDto>> GetExpensesByUserIdAsync(
        int userId)
    {
        return await _expenseRepository.GetExpensesByUserIdAsync(userId);
    }

    public async Task<ExpenseDto> GetExpensesCountAsync(int userId)
    {
        return await _expenseRepository.GetExpensesCountAsync(userId);
    }

    // FIX 3: Was calling GetExpensesCountAsync on service but had wrong name GetExpenseCountAsync
    public async Task<int> GetExpensesCountAsync()
    {
        return await _expenseRepository.GetExpensesCountAsync();
    }

    public async Task<decimal> GetTotalExpensesByUserIdAsync(
        int userId)
    {
        return await _expenseRepository.GetTotalExpensesByUserIdAsync(userId);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndMonthAsync(
        int userId,
        int month)
    {
        return await _expenseRepository
            .GetTotalExpensesByUserIdAndMonthAsync(userId, month);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndCategoryAndMonthAsync(
        int userId,
        string category,
        int month)
    {
        return await _expenseRepository
            .GetTotalExpensesByUserIdAndCategoryAndMonthAsync(
                userId,
                category,
                month);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndCategoryAndYearAsync(
        int userId,
        string category,
        int year)
    {
        return await _expenseRepository
            .GetTotalExpensesByUserIdAndCategoryAndYearAsync(
                userId,
                category,
                year);
    }

    // FIX 4: Was calling GetTotalIncomesByUserIdAndCategoryAsync (wrong method name)
    public async Task<decimal> GetTotalExpensesByUserIdAndCategoryAsync(
        int userId,
        string category)
    {
        return await _expenseRepository
            .GetTotalExpensesByUserIdAndCategoryAsync(
                userId,
                category);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndYearAsync(
        int userId,
        int year)
    {
        return await _expenseRepository
            .GetTotalExpensesByUserIdAndYearAsync(
                userId,
                year);
    }

    public async Task<bool> UpdateExpenseAsync(
        Guid id,
        ExpenseDto expenseDto,
        int userId)
    {
        var existingExpense =
            await _expenseRepository.GetExpenseByIdAsync(id, userId);

        if (existingExpense == null)
            return false;

        existingExpense.Amount = expenseDto.Amount;
        existingExpense.Category = expenseDto.Category;
        existingExpense.ExpenseDate = expenseDto.ExpenseDate;
        existingExpense.Description = expenseDto.Description;

        await _expenseRepository.UpdateExpenseAsync(existingExpense);

        return true;
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllExpensesByUserIdAsync(
        int userId)
    {
        return await _expenseRepository.GetAllExpensesByUserIdAsync(userId);
    }
}