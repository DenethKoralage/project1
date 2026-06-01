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
            RemainingBudget = remainingBudget
        };
    }

    public async Task<BudgetDto> CreateBudgetAsync(BudgetDto budgetDto, int userId)
    {
        var budget = new Budget
        {
            Id = budgetDto.Id == Guid.Empty ? Guid.NewGuid() : budgetDto.Id,
            UserId = userId,
            Name = budgetDto.Name.Trim(),
            Amount = budgetDto.Amount,
            Title = budgetDto.Title.Trim(),
            Category = budgetDto.Category.Trim(),
            StartDate = budgetDto.StartDate,
            EndDate = budgetDto.EndDate,
            Description = budgetDto.Description.Trim(),
            TotalBudget = budgetDto.TotalBudget,
            RemainingBudget = budgetDto.RemainingBudget
        };

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

        budget.Name = budgetDto.Name.Trim();
        budget.Amount = budgetDto.Amount;
        budget.Title = budgetDto.Title.Trim();
        budget.Category = budgetDto.Category.Trim();
        budget.StartDate = budgetDto.StartDate;
        budget.EndDate = budgetDto.EndDate;
        budget.Description = budgetDto.Description.Trim();
        budget.TotalBudget = budgetDto.TotalBudget;
        budget.RemainingBudget = budgetDto.RemainingBudget;

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
}
