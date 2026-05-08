using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using System;
using System.Collections.Generic;
using System.Text;

namespace backend.Infrastructure.Repositories;

public class IncomeRepository : IIncomeRepository
{
    private readonly AppDbContext _context;

    public IncomeRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Income> CreateIncomeAsync(Income income)
    {
        _context.Incomes.Add(income);
        await _context.SaveChangesAsync();
        return income;
    }

    public Task DeleteIncomeAsync(int id)
    {
        throw new NotImplementedException();
    }
    
    public Task<IEnumerable<Income>> GetAllIncomesAsync()
    {
        throw new NotImplementedException();
    }
    
    public Task<Income?> GetIncomeByIdAsync(int id)
    {
        throw new NotImplementedException();
    }
    
    public Task<IEnumerable<Income>> GetIncomesByUserIdAsync(int userId)
    {
        throw new NotImplementedException();
    }
    
    public Task<int> GetIncomesCountAsync()
    {
        throw new NotImplementedException();
    }
    
    public Task UpdateIncomeAsync(Income income)
    {
        throw new NotImplementedException();
    }
}