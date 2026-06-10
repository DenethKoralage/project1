using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly AppDbContext _context;

    public ExpenseRepository(AppDbContext context)
    {
        _context = context;
    }

    private static ExpenseDto MapToDto(Expense expense)
    {
        return new ExpenseDto
        {
            Id = expense.Id,
            Amount = expense.Amount,
            Category = expense.Category,
            ExpenseDate = expense.ExpenseDate,
            Description = expense.Description
        };
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllExpensesAsync()
    {
        return await _context.Expenses
            .Select(i => new ExpenseDto
            {
                Id = i.Id,
                Amount = i.Amount,
                Category = i.Category,
                ExpenseDate = i.ExpenseDate,
                Description = i.Description
            })
            .ToListAsync();
    }

    public async Task<ExpenseDto?> GetExpenseByIdAsync(Guid id, int userId)
    {
        var expense = await _context.Expenses
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        return expense == null ? null : MapToDto(expense);
    }

    public async Task<ExpenseDto> CreateExpenseAsync(ExpenseDto expenseDto, int userId)
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

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();

        expenseDto.Id = expense.Id;
        return expenseDto;
    }

    public async Task<bool> UpdateExpenseAsync(Guid id, ExpenseDto expenseDto, int userId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (expense == null)
            return false;

        expense.Amount = expenseDto.Amount;
        expense.Category = expenseDto.Category;
        expense.ExpenseDate = expenseDto.ExpenseDate;
        expense.Description = expenseDto.Description;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteExpenseAsync(Guid id, int userId)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (expense == null)
            return false;

        _context.Expenses.Remove(expense);
        await _context.SaveChangesAsync();

        return true;
    }

    // FIX 1: Return type was IEnumerable<IncomeDto> — corrected to IEnumerable<ExpenseDto>
    public async Task<IEnumerable<ExpenseDto>> GetExpensesByUserIdAsync(int userId)
    {
        return await _context.Expenses
            .Where(i => i.UserId == userId)
            .Select(i => new ExpenseDto
            {
                Id = i.Id,
                Amount = i.Amount,
                Category = i.Category,
                ExpenseDate = i.ExpenseDate,
                Description = i.Description
            })
            .ToListAsync();
    }

    public async Task<ExpenseDto> GetExpensesCountAsync(int userId)
    {
        var count = await _context.Expenses
            .CountAsync(i => i.UserId == userId);

        return new ExpenseDto
        {
            Description = count.ToString()
        };
    }

    // FIX 2: This method was missing from the repository — added to satisfy interface
    public async Task<int> GetExpensesCountAsync()
    {
        return await _context.Expenses.CountAsync();
    }

    public async Task<decimal> GetTotalExpensesByUserIdAsync(int userId)
    {
        return await _context.Expenses
            .Where(i => i.UserId == userId)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndMonthAsync(int userId, int month)
    {
        return await _context.Expenses
            .Where(i => i.UserId == userId &&
                        i.ExpenseDate.Month == month)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndCategoryAndMonthAsync(
        int userId,
        string category,
        int month)
    {
        return await _context.Expenses
            .Where(i => i.UserId == userId &&
                        i.Category == category &&
                        i.ExpenseDate.Month == month)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndCategoryAndYearAsync(
        int userId,
        string category,
        int year)
    {
        return await _context.Expenses
            .Where(i => i.UserId == userId &&
                        i.Category == category &&
                        i.ExpenseDate.Year == year)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndCategoryAsync(
        int userId,
        string category)
    {
        return await _context.Expenses
            .Where(i => i.UserId == userId &&
                        i.Category == category)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalExpensesByUserIdAndYearAsync(
        int userId,
        int year)
    {
        return await _context.Expenses
            .Where(i => i.UserId == userId &&
                        i.ExpenseDate.Year == year)
            .SumAsync(i => i.Amount);
    }

    public async Task CreateExpenseAsync(Expense expense)
    {
        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateExpenseAsync(ExpenseDto expenseDto)
    {
        var expense = await _context.Expenses
            .FirstOrDefaultAsync(i => i.Id == expenseDto.Id);

        if (expense == null)
            return;

        expense.Amount = expenseDto.Amount;
        expense.Category = expenseDto.Category;
        expense.ExpenseDate = expenseDto.ExpenseDate;
        expense.Description = expenseDto.Description;

        await _context.SaveChangesAsync();
    }
}