using backend.Application.DTOs;

namespace backend.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterAsync(UserDto userDto);
    Task<AuthResponseDto?> LoginAsync(UserLoginDto userLoginDto);
}
