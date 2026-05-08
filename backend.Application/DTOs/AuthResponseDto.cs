namespace backend.Application.DTOs;

public class AuthResponseDto
{
    public string Message { get; set; } = string.Empty;
    public UserDto? User { get; set; }
}
