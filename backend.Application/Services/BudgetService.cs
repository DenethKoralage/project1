using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class BudgetService : IBudgetService
{
    private readonly IBudgetRepository _budgetRepository;
    private readonly IIncomeRepository _incomeRepository;
    private readonly IExpenseRepository _expenseRepository;

    public BudgetService(
        IBudgetRepository budgetRepository,
        IIncomeRepository incomeRepository,
        IExpenseRepository expenseRepository)
    {
        _budgetRepository = budgetRepository;
        _incomeRepository = incomeRepository;
        _expenseRepository = expenseRepository;
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
        var totalIncome = await _incomeRepository.GetTotalIncomesByUserIdAsync(userId);
        var totalExpenses = await _expenseRepository.GetTotalExpensesByUserIdAsync(userId);

        return new BudgetDto
        {
            UserId = userId,
            TotalBudget = totalIncome,
            RemainingBudget = totalIncome - totalExpenses,
            Amount = totalExpenses
        };
    }

    public async Task<BudgetDto> CreateBudgetAsync(BudgetDto budgetDto, int userId)
    {
        var amount = GetBudgetAmount(budgetDto);
        await EnsureAllocationFitsCurrentBudget(userId, amount);
        var budget = Budget.Create(
            userId,
            budgetDto.Name,
            amount,
            budgetDto.Title,
            budgetDto.Category,
            budgetDto.ExpectedDate,
            budgetDto.Description,
            amount);

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
        await EnsureAllocationFitsCurrentBudget(userId, amount, budget.Id);
        var remainingBudget = GetRemainingBudgetForUpdate(budgetDto, budget, amount);
        budget.UpdateDetails(
            budgetDto.Name,
            amount,
            budgetDto.Title,
            budgetDto.Category,
            budgetDto.ExpectedDate,
            budgetDto.Description,
            remainingBudget);

        await _budgetRepository.UpdateBudgetAsync(budget);
        return true;
    }

    public async Task<bool> MarkBudgetAsSpentAsync(Guid id, int userId)
    {
        var budget = await _budgetRepository.GetBudgetByIdAsync(id);
        if (budget == null || budget.UserId != userId)
        {
            return false;
        }

        if (budget.IsSpent)
        {
            throw new InvalidOperationException("This budget allocation is already marked as spent.");
        }

        var spendAmount = budget.RemainingBudget > 0 ? budget.RemainingBudget : budget.TotalBudget;
        if (spendAmount <= 0)
        {
            throw new InvalidOperationException("This budget allocation does not have an amount to spend.");
        }

        var spentAt = DateTime.UtcNow;
        var expense = Expense.Create(
            userId,
            spendAmount,
            budget.Category,
            spentAt,
            LimitDescription(string.IsNullOrWhiteSpace(budget.Description)
                ? $"Spent budget allocation: {budget.Name}"
                : $"Spent budget allocation: {budget.Name}. {budget.Description}"));

        await _expenseRepository.CreateExpenseAsync(expense);
        budget.MarkAsSpent(expense.Id, spentAt);
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
            ExpectedDate = budget.ExpectedDate,
            Description = budget.Description,
            TotalBudget = budget.TotalBudget,
            RemainingBudget = budget.RemainingBudget,
            IsSpent = budget.IsSpent,
            SpentAt = budget.SpentAt,
            ExpenseId = budget.ExpenseId
        };
    }

    private static decimal GetBudgetAmount(BudgetDto budgetDto)
    {
        return budgetDto.Amount > 0 ? budgetDto.Amount : budgetDto.TotalBudget;
    }

    private static decimal GetRemainingBudgetForUpdate(BudgetDto budgetDto, Budget budget, decimal amount)
    {
        if (budget.IsSpent)
        {
            return 0;
        }

        if (budgetDto.RemainingBudget > 0)
        {
            return budgetDto.RemainingBudget;
        }

        return budget.RemainingBudget > 0 ? budget.RemainingBudget : amount;
    }

    private async Task EnsureAllocationFitsCurrentBudget(
        int userId,
        decimal amount,
        Guid? budgetIdToExclude = null)
    {
        var summary = await GetBudgetSummaryAsync(userId);
        var allocations = await _budgetRepository.GetBudgetsByUserIdAsync(userId);
        var allocatedRemaining = allocations
            .Where(budget => !budget.IsSpent && budget.RemainingBudget > 0 && budget.Id != budgetIdToExclude)
            .Sum(budget => budget.RemainingBudget);
        var availableToAllocate = summary.RemainingBudget - allocatedRemaining;

        if (amount > availableToAllocate)
        {
            throw new InvalidOperationException("Budget allocation cannot exceed the current unallocated budget.");
        }
    }

    private static string LimitDescription(string description)
    {
        return description.Length <= 512 ? description : description[..512];
    }
}
