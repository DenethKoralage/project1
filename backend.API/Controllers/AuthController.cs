using backend.Application.DTOs;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(UserDto userDto)
    {
        var result = await _authService.RegisterAsync(userDto);
        if (result.User == null)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(UserLoginDto userLoginDto)
    {
        var result = await _authService.LoginAsync(userLoginDto);

        return result == null
            ? BadRequest(new { message = "Invalid email or password." })
            : Ok(result);
    }
}
