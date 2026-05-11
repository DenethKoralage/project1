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

    public async Task<AuthResponseDto> RegisterAsync(UserRegistrationDto userRegistrationDto)
    {
        var normalizedEmail = NormalizeEmail(userRegistrationDto.Email);

        if (await _userRepository.EmailExistsAsync(normalizedEmail))
        {
            return new AuthResponseDto { Message = "User with this email already exists." };
        }

        var user = new User
        {
            Name = userRegistrationDto.Name.Trim(),
            Email = normalizedEmail,
            Password = PasswordHelper.HashPassword(userRegistrationDto.Password),
            Designation = userRegistrationDto.Designation.Trim(),
            AVGIncome = userRegistrationDto.AVGIncome
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
            AVGIncome = user.AVGIncome
        };
    }
}
