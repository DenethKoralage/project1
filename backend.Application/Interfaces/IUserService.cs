using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllUsersAsync();
    Task<UserDto?> GetUserByIdAsync(int id);
    Task<UserDto> CreateUserAsync(UserDto userDto);
    Task<bool> UpdateUserAsync(int id, UserDto userDto);
    Task<bool> DeleteUserAsync(int id);
    Task<int> GetUsersCountAsync();
    Task<IEnumerable<UserDto>> GetUsersByDesignationAsync(string designation);
    Task<IEnumerable<UserDto>> GetUsersWithIncomeAboveAsync(decimal incomeThreshold);
    Task<IEnumerable<UserDto>> GetUsersWithIncomeBelowAsync(decimal incomeThreshold);
    Task<IEnumerable<UserDto>> GetUsersWithIncomeBetweenAsync(decimal minIncome, decimal maxIncome);
    Task<IEnumerable<UserDto>> GetUsersWithIncomeAboveAverageAsync();
    Task<IEnumerable<UserDto>> GetUsersWithIncomeBelowAverageAsync();
}
