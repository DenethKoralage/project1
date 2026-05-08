using backend.Application.DTOs;
using backend.Application.Helpers;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;

    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<AuthResponseDto> RegisterAsync(UserRegistrationDto userRegistrationDto)
    {
        if (await _userRepository.EmailExistsAsync(userRegistrationDto.Email))
        {
            return new AuthResponseDto { Message = "User with this email already exists." };
        }

        var user = new User
        {
            Name = userRegistrationDto.Name,
            Email = userRegistrationDto.Email,
            Password = PasswordHelper.HashPassword(userRegistrationDto.Password),
            Designation = userRegistrationDto.Designation,
            AVGIncome = userRegistrationDto.AVGIncome
        };

        var createdUser = await _userRepository.CreateUserAsync(user);

        return new AuthResponseDto
        {
            Message = "User registered successfully.",
            User = MapToDto(createdUser)
        };
    }

    public async Task<AuthResponseDto?> LoginAsync(UserLoginDto userLoginDto)
    {
        var user = await _userRepository.GetUserByEmailAsync(userLoginDto.Email);
        if (user == null || !PasswordHelper.VerifyPassword(userLoginDto.Password, user.Password))
        {
            return null;
        }

        return new AuthResponseDto
        {
            Message = "Login successful.",
            User = MapToDto(user)
        };
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
