using backend.Application.DTOs;
using backend.Application.Helpers;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllUsersAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto?> GetUserByIdAsync(int id)
    {
        var user = await _userRepository.GetUserByIdAsync(id);
        return user == null ? null : MapToDto(user);
    }

    public async Task<UserDto> CreateUserAsync(UserDto userDto)
    {
        if (string.IsNullOrWhiteSpace(userDto.Password) || userDto.IncomeAmount is null or <= 0)
        {
            throw new ArgumentException("Password and income amount are required.");
        }

        var normalizedEmail = NormalizeEmail(userDto.Email);

        if (await _userRepository.EmailExistsAsync(normalizedEmail))
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        var user = new User
        {
            Name = userDto.Name.Trim(),
            Email = normalizedEmail,
            Password = PasswordHelper.HashPassword(userDto.Password),
            Designation = userDto.Designation.Trim(),
            Workplace = userDto.Workplace.Trim(),
            HomeAddress = userDto.HomeAddress.Trim(),
            HomeCity = userDto.HomeCity.Trim(),
            Country = userDto.Country.Trim(),
            Currency = userDto.Currency.Trim().ToUpperInvariant(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Expenses = new List<Expense>(),
            Budgets = new List<Budget>(),
            Incomes =
            [
                Income.Create(
                    0,
                    userDto.IncomeAmount.Value,
                    "Monthly income",
                    "Salary",
                    DateTime.UtcNow,
                    "Initial income recorded during registration.")
            ]
        };

        var createdUser = await _userRepository.CreateUserAsync(user);
        return MapToDto(createdUser);
    }

    public async Task<bool> UpdateUserAsync(int id, UpdateUserDto userDto)
    {
        var user = await _userRepository.GetUserByIdAsync(id);
        if (user == null)
        {
            return false;
        }

        var normalizedEmail = NormalizeEmail(userDto.Email);
        var existingUser = await _userRepository.GetUserByEmailAsync(normalizedEmail);
        if (existingUser != null && existingUser.Id != id)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        user.Name = userDto.Name.Trim();
        user.Email = normalizedEmail;
        user.Designation = userDto.Designation.Trim();
        user.Workplace = userDto.Workplace.Trim();
        user.HomeAddress = userDto.HomeAddress.Trim();
        user.HomeCity = userDto.HomeCity.Trim();
        user.Country = userDto.Country.Trim();
        user.Currency = userDto.Currency.Trim().ToUpperInvariant();
        user.UpdatedAt = DateTime.UtcNow;

        await _userRepository.UpdateUserAsync(user);
        return true;
    }

    public async Task<bool> DeleteUserAsync(int id)
    {
        var user = await _userRepository.GetUserByIdAsync(id);
        if (user == null)
        {
            return false;
        }

        await _userRepository.DeleteUserAsync(id);
        return true;
    }

    public async Task<int> GetUsersCountAsync()
    {
        return await _userRepository.GetUsersCountAsync();
    }

    public async Task<IEnumerable<UserDto>> GetUsersByDesignationAsync(string designation)
    {
        var users = await _userRepository.GetUsersByDesignationAsync(designation);
        return users.Select(MapToDto);
    }

    public async Task<IEnumerable<UserDto>> GetUsersWithIncomeAboveAsync(decimal incomeThreshold)
    {
        var users = await _userRepository.GetUsersWithIncomeAboveAsync(incomeThreshold);
        return users.Select(MapToDto);
    }

    public async Task<IEnumerable<UserDto>> GetUsersWithIncomeBelowAsync(decimal incomeThreshold)
    {
        var users = await _userRepository.GetUsersWithIncomeBelowAsync(incomeThreshold);
        return users.Select(MapToDto);
    }

    public async Task<IEnumerable<UserDto>> GetUsersWithIncomeBetweenAsync(decimal minIncome, decimal maxIncome)
    {
        if (minIncome > maxIncome)
        {
            throw new ArgumentException("Minimum income cannot be greater than maximum income.");
        }

        var users = await _userRepository.GetUsersWithIncomeBetweenAsync(minIncome, maxIncome);
        return users.Select(MapToDto);
    }

    public async Task<IEnumerable<UserDto>> GetUsersWithIncomeAboveAverageAsync()
    {
        var users = await _userRepository.GetUsersWithIncomeAboveAverageAsync();
        return users.Select(MapToDto);
    }

    public async Task<IEnumerable<UserDto>> GetUsersWithIncomeBelowAverageAsync()
    {
        var users = await _userRepository.GetUsersWithIncomeBelowAverageAsync();
        return users.Select(MapToDto);
    }

    private static string NormalizeEmail(string email)
    {
        return email.Trim().ToLowerInvariant();
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Designation = user.Designation,
            Workplace = user.Workplace,
            HomeAddress = user.HomeAddress,
            HomeCity = user.HomeCity,
            Country = user.Country,
            Currency = user.Currency,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Incomes = user.Incomes.Select(i => new IncomeDto
            {
                Id = i.Id,
                Amount = i.Amount,
                Source = i.Source,
                Category = i.Category,
                IncomeDate = i.IncomeDate,
                Description = i.Description,
            }).ToList(),
            Expenses = user.Expenses.Select(e => new ExpenseDto
            {
                Id = e.Id,
                Amount = e.Amount,
                Category = e.Category,
                ExpenseDate = e.ExpenseDate,
                Description = e.Description
            }).ToList(),
            Budgets = user.Budgets.Select(b => new BudgetDto
            {
                Id = b.Id,
                UserId = b.UserId,
                Name = b.Name,
                Amount = b.Amount,
                Title = b.Title,
                Category = b.Category,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                Description = b.Description,
                TotalBudget = b.TotalBudget,
                RemainingBudget = b.RemainingBudget
            }).ToList(),
        };
    }
}
