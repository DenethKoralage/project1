using System.ComponentModel.DataAnnotations;

namespace backend.Application.DTOs;

public class UserRegistrationDto
{
    [Required]
    [StringLength(120, MinimumLength = 2)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [StringLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [StringLength(100)]
    public string Password { get; set; } = string.Empty;

    [Required]
    [StringLength(120)]
    public string Designation { get; set; } = string.Empty;

    [Range(0, int.MaxValue)]
    public int AVGIncome { get; set; }
}
