using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories;

public class IncomeRepository : IIncomeRepository
{
    private readonly AppDbContext _context;

    public IncomeRepository(AppDbContext context)
    {
        _context = context;
    }

    private static IncomeDto MapToDto(Income income)
    {
        return new IncomeDto
        {
            Id = income.Id,
            Amount = income.Amount,
            Source = income.Source,
            Category = income.Category,
            IncomeDate = income.IncomeDate,
            Description = income.Description
        };
    }

    public async Task<IEnumerable<IncomeDto>> GetAllIncomesAsync()
    {
        return await _context.Incomes
            .Select(i => new IncomeDto
            {
                Id = i.Id,
                Amount = i.Amount,
                Source = i.Source,
                Category = i.Category,
                IncomeDate = i.IncomeDate,
                Description = i.Description
            })
            .ToListAsync();
    }

    public async Task<IncomeDto?> GetIncomeByIdAsync(Guid id, int userId)
    {
        var income = await _context.Incomes
            .AsNoTracking()
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        return income == null ? null : MapToDto(income);
    }

    public async Task<IncomeDto> CreateIncomeAsync(IncomeDto incomeDto, int userId)
    {
        var income = new Income
        {
            Id = Guid.NewGuid(),
            Amount = incomeDto.Amount,
            Source = incomeDto.Source,
            Category = incomeDto.Category,
            IncomeDate = incomeDto.IncomeDate,
            Description = incomeDto.Description,
            UserId = userId
        };

        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();

        incomeDto.Id = income.Id;
        return incomeDto;
    }

    public async Task<bool> UpdateIncomeAsync(Guid id, IncomeDto incomeDto, int userId)
    {
        var income = await _context.Incomes
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (income == null)
            return false;

        income.Amount = incomeDto.Amount;
        income.Source = incomeDto.Source;
        income.Category = incomeDto.Category;
        income.IncomeDate = incomeDto.IncomeDate;
        income.Description = incomeDto.Description;

        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeleteIncomeAsync(Guid id, int userId)
    {
        var income = await _context.Incomes
            .FirstOrDefaultAsync(i => i.Id == id && i.UserId == userId);

        if (income == null)
            return false;

        _context.Incomes.Remove(income);
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<IEnumerable<IncomeDto>> GetIncomesByUserIdAsync(int userId)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId)
            .Select(i => new IncomeDto
            {
                Id = i.Id,
                Amount = i.Amount,
                Source = i.Source,
                Category = i.Category,
                IncomeDate = i.IncomeDate,
                Description = i.Description
            })
            .ToListAsync();
    }

    public async Task<IncomeDto> GetIncomesCountAsync(int userId)
    {
        var count = await _context.Incomes
            .CountAsync(i => i.UserId == userId);

        return new IncomeDto
        {
            Description = count.ToString()
        };
    }

    public async Task<int> GetIncomesCountAsync()
    {
        return await _context.Incomes.CountAsync();
    }

    public async Task<decimal> GetTotalIncomesByUserIdAsync(int userId)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndMonthAsync(int userId, int month)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId &&
                        i.IncomeDate.Month == month)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndCategoryAndMonthAsync(
        int userId,
        string category,
        int month)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId &&
                        i.Category == category &&
                        i.IncomeDate.Month == month)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndCategoryAndYearAsync(
        int userId,
        string category,
        int year)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId &&
                        i.Category == category &&
                        i.IncomeDate.Year == year)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndCategoryAsync(
        int userId,
        string category)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId &&
                        i.Category == category)
            .SumAsync(i => i.Amount);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndYearAsync(
        int userId,
        int year)
    {
        return await _context.Incomes
            .Where(i => i.UserId == userId &&
                        i.IncomeDate.Year == year)
            .SumAsync(i => i.Amount);
    }

    public async Task CreateIncomeAsync(Income income)
    {
        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateIncomeAsync(IncomeDto incomeDto)
    {
        var income = await _context.Incomes
            .FirstOrDefaultAsync(i => i.Id == incomeDto.Id);

        if (income == null)
            return;

        income.Amount = incomeDto.Amount;
        income.Source = incomeDto.Source;
        income.Category = incomeDto.Category;
        income.IncomeDate = incomeDto.IncomeDate;
        income.Description = incomeDto.Description;

        await _context.SaveChangesAsync();
    }
}