using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(UserRegistrationDto userRegistrationDto);
    Task<AuthResponseDto?> LoginAsync(UserLoginDto userLoginDto);
}
