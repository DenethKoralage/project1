namespace backend.Application.DTOs;

public class JwtTokenDto
{
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
}
