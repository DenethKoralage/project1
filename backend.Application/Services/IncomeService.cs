using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class IncomeService : IIncomeService
{
    private readonly IIncomeRepository _incomeRepository;

    public IncomeService(IIncomeRepository incomeRepository)
    {
        _incomeRepository = incomeRepository;
    }

    public async Task<IncomeDto> CreateIncomeAsync(
        IncomeDto incomeDto,
        int userId)
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

        await _incomeRepository.CreateIncomeAsync(income);

        incomeDto.Id = income.Id;

        return incomeDto;
    }

    public async Task<bool> DeleteIncomeAsync(
        Guid id,
        int userId)
    {
        var income = await _incomeRepository.GetIncomeByIdAsync(id, userId);

        if (income == null)
            return false;

        return await _incomeRepository.DeleteIncomeAsync(id, userId);
    }

    public async Task<IEnumerable<IncomeDto>> GetAllIncomesAsync()
    {
        return await _incomeRepository.GetAllIncomesAsync();
    }

    public async Task<IncomeDto?> GetIncomeByIdAsync(
        Guid id,
        int userId)
    {
        return await _incomeRepository.GetIncomeByIdAsync(id, userId);
    }

    public async Task<IEnumerable<IncomeDto>> GetIncomesByUserIdAsync(
        int userId)
    {
        return await _incomeRepository.GetIncomesByUserIdAsync(userId);
    }

    public async Task<IncomeDto> GetIncomesCountAsync(int userId)
    {
        return await _incomeRepository.GetIncomesCountAsync(userId);
    }

    public async Task<int> GetIncomesCountAsync()
    {
        return await _incomeRepository.GetIncomesCountAsync();
    }

    public async Task<decimal> GetTotalIncomesByUserIdAsync(
        int userId)
    {
        return await _incomeRepository.GetTotalIncomesByUserIdAsync(userId);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndMonthAsync(
        int userId,
        int month)
    {
        return await _incomeRepository
            .GetTotalIncomesByUserIdAndMonthAsync(userId, month);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndCategoryAndMonthAsync(
        int userId,
        string category,
        int month)
    {
        return await _incomeRepository
            .GetTotalIncomesByUserIdAndCategoryAndMonthAsync(
                userId,
                category,
                month);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndCategoryAndYearAsync(
        int userId,
        string category,
        int year)
    {
        return await _incomeRepository
            .GetTotalIncomesByUserIdAndCategoryAndYearAsync(
                userId,
                category,
                year);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndCategoryAsync(
        int userId,
        string category)
    {
        return await _incomeRepository
            .GetTotalIncomesByUserIdAndCategoryAsync(
                userId,
                category);
    }

    public async Task<decimal> GetTotalIncomesByUserIdAndYearAsync(
        int userId,
        int year)
    {
        return await _incomeRepository
            .GetTotalIncomesByUserIdAndYearAsync(
                userId,
                year);
    }

    public async Task<bool> UpdateIncomeAsync(
        Guid id,
        IncomeDto incomeDto,
        int userId)
    {
        var existingIncome =
            await _incomeRepository.GetIncomeByIdAsync(id, userId);

        if (existingIncome == null)
            return false;

        existingIncome.Amount = incomeDto.Amount;
        existingIncome.Source = incomeDto.Source;
        existingIncome.Category = incomeDto.Category;
        existingIncome.IncomeDate = incomeDto.IncomeDate;
        existingIncome.Description = incomeDto.Description;

        await _incomeRepository.UpdateIncomeAsync(existingIncome);

        return true;
    }
}