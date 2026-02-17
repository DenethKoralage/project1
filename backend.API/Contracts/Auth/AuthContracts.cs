using System.ComponentModel.DataAnnotations;

namespace backend.API.Contracts.Auth;

public class RegisterRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal AvgIncome { get; set; }
}

public class LoginRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    [Required]
    public string FullName { get; set; } = string.Empty;

    public string Designation { get; set; } = string.Empty;

    [Range(0, double.MaxValue)]
    public decimal AvgIncome { get; set; }

    [MinLength(6)]
    public string? NewPassword { get; set; }
}

public class DeleteAccountRequest
{
    [Required]
    public string Password { get; set; } = string.Empty;
}

public class AuthUserDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public decimal AvgIncome { get; set; }
}

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public AuthUserDto User { get; set; } = new();
}
