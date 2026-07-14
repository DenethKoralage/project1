using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        return await GetUsersWithDetails().ToListAsync();
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await GetUsersWithDetails().FirstOrDefaultAsync(user => user.Id == id);
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        var normalizedEmail = NormalizeEmail(email);
        return await _context.Users.FirstOrDefaultAsync(user => user.Email.ToLower() == normalizedEmail);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        var normalizedEmail = NormalizeEmail(email);
        return await _context.Users.AnyAsync(user => user.Email.ToLower() == normalizedEmail);
    }

    public async Task<User> CreateUserAsync(User user)
    {
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return user;
    }

    public async Task UpdateUserAsync(User user)
    {
        await _context.SaveChangesAsync();
    }

    public async Task DeleteUserAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user != null)
        {
            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<int> GetUsersCountAsync()
    {
        return await _context.Users.CountAsync();
    }

    public async Task<IEnumerable<User>> GetUsersByDesignationAsync(string designation)
    {
        return await GetUsersWithDetails()
            .Where(user => user.Designation == designation)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersWithIncomeAboveAsync(decimal incomeThreshold)
    {
        return await GetUsersWithDetails()
            .Where(user => user.Incomes.Sum(income => income.Amount) > incomeThreshold)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersWithIncomeBelowAsync(decimal incomeThreshold)
    {
        return await GetUsersWithDetails()
            .Where(user => user.Incomes.Sum(income => income.Amount) < incomeThreshold)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersWithIncomeBetweenAsync(decimal minIncome, decimal maxIncome)
    {
        return await GetUsersWithDetails()
            .Where(user => user.Incomes.Sum(income => income.Amount) >= minIncome &&
                           user.Incomes.Sum(income => income.Amount) <= maxIncome)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersWithIncomeAboveAverageAsync()
    {
        if (!await _context.Incomes.AnyAsync())
        {
            return [];
        }

        var averageIncome = await _context.Incomes.AverageAsync(income => income.Amount);
        return await GetUsersWithDetails()
            .Where(user => user.Incomes.Sum(income => income.Amount) > averageIncome)
            .ToListAsync();
    }

    public async Task<IEnumerable<User>> GetUsersWithIncomeBelowAverageAsync()
    {
        if (!await _context.Incomes.AnyAsync())
        {
            return [];
        }

        var averageIncome = await _context.Incomes.AverageAsync(income => income.Amount);
        return await GetUsersWithDetails()
            .Where(user => user.Incomes.Sum(income => income.Amount) < averageIncome)
            .ToListAsync();
    }

    private IQueryable<User> GetUsersWithDetails()
    {
        return _context.Users
            .Include(user => user.Incomes)
            .Include(user => user.Expenses)
            .Include(user => user.Budgets);
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }
}
