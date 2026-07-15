using backend.Application.DTOs;
using backend.Application.Helpers;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthService(IUserRepository userRepository, IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(UserDto userDto)
    {
        if (string.IsNullOrWhiteSpace(userDto.Password) || userDto.IncomeAmount is null or <= 0)
        {
            return new AuthResponseDto { Message = "Password and income amount are required." };
        }

        var normalizedEmail = NormalizeEmail(userDto.Email);

        if (await _userRepository.EmailExistsAsync(normalizedEmail))
        {
            return new AuthResponseDto { Message = "User with this email already exists." };
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
        var token = _jwtTokenService.GenerateToken(createdUser);

        return new AuthResponseDto
        {
            Message = "User registered successfully.",
            User = MapToDto(createdUser),
            Token = token.Token,
            ExpiresAt = token.ExpiresAt
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(UserLoginDto userLoginDto)
    {
        var user = await _userRepository.GetUserByEmailAsync(NormalizeEmail(userLoginDto.Email));
        if (user == null || !PasswordHelper.VerifyPassword(userLoginDto.Password, user.Password))
        {
            return null;
        }

        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponseDto
        {
            Message = "Login successful.",
            User = MapToDto(user),
            Token = token.Token,
            ExpiresAt = token.ExpiresAt
        };
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
            Incomes = user.Incomes.Select(income => new IncomeDto
            {
                Id = income.Id,
                Amount = income.Amount,
                Source = income.Source,
                Category = income.Category,
                IncomeDate = income.IncomeDate,
                Description = income.Description
            }).ToList()
        };
    }
}
