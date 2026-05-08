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
        var user = new User
        {
            Name = userRegistrationDto.Name,
            Email = userRegistrationDto.Email,
            Password = PasswordHelper.HashPassword(userRegistrationDto.Password),
            Designation = userRegistrationDto.Designation,
            AVGIncome = userRegistrationDto.AVGIncome
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

        user.Name = userRegistrationDto.Name;
        user.Email = userRegistrationDto.Email;
        user.Password = PasswordHelper.HashPassword(userRegistrationDto.Password);
        user.Designation = userRegistrationDto.Designation;
        user.AVGIncome = userRegistrationDto.AVGIncome;

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
