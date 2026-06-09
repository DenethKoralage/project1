using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _budgetRepository;

    public BudgetService(IBudgetRepository budgetRepository)
    {
        _budgetRepository = budgetRepository;
    }

    public async Task<IEnumerable<BudgetDto>> GetAllBudgetsAsync()
    {
        var budgets = await _budgetRepository.GetAllBudgetsAsync();
        return budgets.Select(MapToDto);
    }

    public async Task<IEnumerable<BudgetDto>> GetBudgetsByUserIdAsync(int userId)
    {
        var budgets = await _budgetRepository.GetBudgetsByUserIdAsync(userId);
        return budgets.Select(MapToDto);
    }

    public async Task<BudgetDto?> GetBudgetByIdAsync(Guid id, int userId)
    {
        var budget = await _budgetRepository.GetBudgetByIdAsync(id);
        return budget == null || budget.UserId != userId ? null : MapToDto(budget);
    }

    public async Task<BudgetDto> GetBudgetSummaryAsync(int userId)
    {
        var totalBudget = await _budgetRepository.GetTotalBudgetAsync(userId);
        var remainingBudget = await _budgetRepository.GetRemainingBudgetAsync(userId);

        return new BudgetDto
        {
            UserId = userId,
            TotalBudget = totalBudget,
            RemainingBudget = remainingBudget,
            Amount = totalBudget
        };
    }

    public async Task<BudgetDto> CreateBudgetAsync(BudgetDto budgetDto, int userId)
    {
        var amount = GetBudgetAmount(budgetDto);
        var remainingBudget = GetRemainingBudget(budgetDto, amount);
        var budget = Budget.Create(
            userId,
            budgetDto.Name,
            amount,
            budgetDto.Title,
            budgetDto.Category,
            budgetDto.StartDate,
            budgetDto.EndDate,
            budgetDto.Description,
            remainingBudget);

        var createdBudget = await _budgetRepository.CreateBudgetAsync(budget);
        return MapToDto(createdBudget);
    }

    public async Task<bool> UpdateBudgetAsync(Guid id, BudgetDto budgetDto, int userId)
    {
        var budget = await _budgetRepository.GetBudgetByIdAsync(id);
        if (budget == null || budget.UserId != userId)
        {
            return false;
        }

        var amount = GetBudgetAmount(budgetDto);
        var remainingBudget = GetRemainingBudget(budgetDto, amount);
        budget.UpdateDetails(
            budgetDto.Name,
            amount,
            budgetDto.Title,
            budgetDto.Category,
            budgetDto.StartDate,
            budgetDto.EndDate,
            budgetDto.Description,
            remainingBudget);

        await _budgetRepository.UpdateBudgetAsync(budget);
        return true;
    }

    public async Task<bool> DeleteBudgetAsync(Guid id, int userId)
    {
        var budget = await _budgetRepository.GetBudgetByIdAsync(id);
        if (budget == null || budget.UserId != userId)
        {
            return false;
        }

        await _budgetRepository.DeleteBudgetAsync(id);
        return true;
    }

    private static BudgetDto MapToDto(Budget budget)
    {
        return new BudgetDto
        {
            Id = budget.Id,
            UserId = budget.UserId,
            Name = budget.Name,
            Amount = budget.Amount,
            Title = budget.Title,
            Category = budget.Category,
            StartDate = budget.StartDate,
            EndDate = budget.EndDate,
            Description = budget.Description,
            TotalBudget = budget.TotalBudget,
            RemainingBudget = budget.RemainingBudget
        };
    }

    private static decimal GetBudgetAmount(BudgetDto budgetDto)
    {
        return budgetDto.Amount > 0 ? budgetDto.Amount : budgetDto.TotalBudget;
    }

    private static decimal GetRemainingBudget(BudgetDto budgetDto, decimal amount)
    {
        return budgetDto.RemainingBudget == 0 && budgetDto.TotalBudget == 0
            ? amount
            : budgetDto.RemainingBudget;
    }
}
