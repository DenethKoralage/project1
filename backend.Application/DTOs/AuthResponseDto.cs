namespace backend.Application.DTOs;

public class AuthResponseDto
{
    public Guid Id { get; set; }
    public string Message { get; set; } = string.Empty;
    public UserDto? User { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime? ExpiresAt { get; set; }
}
