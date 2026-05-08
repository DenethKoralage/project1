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

    public async Task<UserDto> CreateUserAsync(UserRegistrationDto userRegistrationDto)
    {
        if (await _userRepository.EmailExistsAsync(userRegistrationDto.Email))
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        var user = new User
        {
            Name = userRegistrationDto.Name,
            Email = userRegistrationDto.Email,
            Password = PasswordHelper.HashPassword(userRegistrationDto.Password),
            Designation = userRegistrationDto.Designation,
            AVGIncome = userRegistrationDto.AVGIncome,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Expenses = new List<Expense>(),
            Budgets = new List<Budget>(),
            Incomes = new List<Income>()
        };

        var createdUser = await _userRepository.CreateUserAsync(user);
        return MapToDto(createdUser);
    }

    public async Task<bool> UpdateUserAsync(int id, UserRegistrationDto userRegistrationDto)
    {
        var user = await _userRepository.GetUserByIdAsync(id);
        if (user == null)
        {
            return false;
        }

        var existingUser = await _userRepository.GetUserByEmailAsync(userRegistrationDto.Email);
        if (existingUser != null && existingUser.Id != id)
        {
            throw new InvalidOperationException("User with this email already exists.");
        }

        user.Name = userRegistrationDto.Name;
        user.Email = userRegistrationDto.Email;
        if (!string.IsNullOrWhiteSpace(userRegistrationDto.Password))
        {
            user.Password = PasswordHelper.HashPassword(userRegistrationDto.Password);
        }
        user.Designation = userRegistrationDto.Designation;
        user.AVGIncome = userRegistrationDto.AVGIncome;
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

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Name = user.Name,
            Email = user.Email,
            Designation = user.Designation,
            AVGIncome = user.AVGIncome,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
            Incomes = user.Incomes.Select(i => new IncomeDto
            {
                Id = i.Id,
                Amount = i.Amount,
                Source = i.Source,
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
                Name = b.Name,
                Amount = b.Amount,
                Category = b.Category,
                StartDate = b.StartDate,
                EndDate = b.EndDate,
                Description = b.Description,
            }).ToList(),
        };
    }
}
