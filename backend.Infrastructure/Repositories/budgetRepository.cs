using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories;

public class BudgetRepository : IBudgetRepository
{
    private readonly AppDbContext _context;

    public BudgetRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Budget>> GetAllBudgetsAsync()
    {
        return await _context.Budgets
            .AsNoTracking()
            .ToListAsync();
    }

    public async Task<IEnumerable<Budget>> GetBudgetsByUserIdAsync(int userId)
    {
        return await _context.Budgets
            .AsNoTracking()
            .Where(budget => budget.UserId == userId)
            .ToListAsync();
    }

    public async Task<Budget?> GetBudgetByIdAsync(Guid id)
    {
        return await _context.Budgets.FindAsync(id);
    }

    public async Task<decimal> GetTotalBudgetAsync(int userId)
    {
        return await _context.Budgets
            .Where(budget => budget.UserId == userId)
            .SumAsync(budget => budget.TotalBudget);
    }

    public async Task<decimal> GetRemainingBudgetAsync(int userId)
    {
        return await _context.Budgets
            .Where(budget => budget.UserId == userId)
            .SumAsync(budget => budget.RemainingBudget);
    }

    public async Task<Budget> CreateBudgetAsync(Budget budget)
    {
        _context.Budgets.Add(budget);
        await _context.SaveChangesAsync();
        return budget;
    }

    public async Task UpdateBudgetAsync(Budget budget)
    {
        _context.Budgets.Update(budget);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteBudgetAsync(Guid id)
    {
        var budget = await _context.Budgets.FindAsync(id);
        if (budget == null)
        {
            return;
        }

        _context.Budgets.Remove(budget);
        await _context.SaveChangesAsync();
    }
}
