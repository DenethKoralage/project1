using backend.Domain.Entities;

namespace backend.Application.Interfaces;

public interface IUserRepository
{
    Task<IEnumerable<User>> GetAllUsersAsync();
    Task<User?> GetUserByIdAsync(int id);
    Task<User?> GetUserByEmailAsync(string email);
    Task<bool> EmailExistsAsync(string email);
    Task<User> CreateUserAsync(User user);
    Task UpdateUserAsync(User user);
    Task DeleteUserAsync(int id);
    Task<int> GetUsersCountAsync();
    Task<IEnumerable<User>> GetUsersByDesignationAsync(string designation);
    Task<IEnumerable<User>> GetUsersWithIncomeAboveAsync(decimal incomeThreshold);
    Task<IEnumerable<User>> GetUsersWithIncomeBelowAsync(decimal incomeThreshold);
    Task<IEnumerable<User>> GetUsersWithIncomeBetweenAsync(decimal minIncome, decimal maxIncome);
    Task<IEnumerable<User>> GetUsersWithIncomeAboveAverageAsync();
    Task<IEnumerable<User>> GetUsersWithIncomeBelowAverageAsync();
}
