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

    [Required]
    [StringLength(120)]
    public string Workplace { get; set; } = string.Empty;

    [Required]
    [StringLength(256)]
    public string HomeAddress { get; set; } = string.Empty;

    [Required]
    [StringLength(120)]
    public string HomeCity { get; set; } = string.Empty;

    [Required]
    [StringLength(120)]
    public string Country { get; set; } = string.Empty;

    [Required]
    [StringLength(10)]
    public string Currency { get; set; } = string.Empty;

    [Range(typeof(decimal), "0.01", "79228162514264337593543950335")]
    public decimal IncomeAmount { get; set; }
}
