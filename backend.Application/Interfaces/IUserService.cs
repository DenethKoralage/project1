using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto> CreateUserAsync(UserRegistrationDto userRegistrationDto);
    Task<bool> UpdateUserAsync(int id, UserRegistrationDto userRegistrationDto);
    Task<bool> DeleteUserAsync(int id);
}
