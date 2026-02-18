using backend.API.Contracts.Auth;
using backend.API.Data;
using backend.API.Models;
using backend.API.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Bson;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly MongoDBContext _db;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(MongoDBContext db, IConfiguration configuration, ILogger<AuthController> logger)
    {
        _db = db;
        _configuration = configuration;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Password) ||
            string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new { message = "Full name, email, and password are required." });
        }

        var email = request.Email.Trim().ToLowerInvariant();

        try
        {
            var exists = await _db.Users.Find(u => u.Email == email).AnyAsync();
            if (exists)
            {
                _logger.LogWarning("Duplicate registration attempt for email: {Email}", email);
                return Conflict(new { message = "An account already exists with this email." });
            }

            var now = DateTime.UtcNow;
            var user = new User
            {
                FullName = request.FullName.Trim(),
                Designation = request.Designation?.Trim() ?? string.Empty,
                Email = email,
                PasswordHash = PasswordHasher.Hash(request.Password),
                AvgIncome = request.AvgIncome,
                CreatedAtUtc = now,
                UpdatedAtUtc = now
            };

            await _db.Users.InsertOneAsync(user);
            var token = GenerateToken(user);

            return Ok(new AuthResponse
            {
                Token = token,
                User = ToAuthUserDto(user)
            });
        }
        catch (MongoWriteException ex) when (ex.WriteError?.Category == ServerErrorCategory.DuplicateKey)
        {
            _logger.LogWarning(ex, "Duplicate key when registering user with email {Email}", email);
            return Conflict(new { message = "An account already exists with this email." });
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "MongoDB failure while registering user with email {Email}", email);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Database is unavailable. Please try again." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error while registering user with email {Email}", email);
            return StatusCode(StatusCodes.Status500InternalServerError, new { message = "Unexpected error while registering user." });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        User? user;
        try
        {
            user = await _db.Users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }
        catch (MongoException ex)
        {
            _logger.LogError(ex, "MongoDB failure while logging in user with email {Email}", email);
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new { message = "Database is unavailable. Please try again." });
        }

        if (user is null || !PasswordHasher.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        var token = GenerateToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = ToAuthUserDto(user)
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logged out." });
    }

    [Authorize]
    [HttpGet("profile")]
    public async Task<ActionResult<AuthUserDto>> GetProfile()
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        return Ok(ToAuthUserDto(user));
    }

    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<AuthUserDto>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        user.FullName = request.FullName.Trim();
        user.Designation = request.Designation?.Trim() ?? string.Empty;
        user.AvgIncome = request.AvgIncome;

        if (!string.IsNullOrWhiteSpace(request.NewPassword))
        {
            user.PasswordHash = PasswordHasher.Hash(request.NewPassword);
        }

        user.UpdatedAtUtc = DateTime.UtcNow;

        await _db.Users.ReplaceOneAsync(u => u.Id == user.Id, user);

        return Ok(ToAuthUserDto(user));
    }

    [Authorize]
    [HttpDelete("account")]
    public async Task<IActionResult> DeleteAccount([FromBody] DeleteAccountRequest request)
    {
        var user = await GetCurrentUserAsync();
        if (user is null)
        {
            return Unauthorized(new { message = "Invalid token." });
        }

        if (!PasswordHasher.Verify(request.Password, user.PasswordHash))
        {
            return BadRequest(new { message = "Password is incorrect." });
        }

        await _db.Users.DeleteOneAsync(u => u.Id == user.Id);
        return Ok(new { message = "Account deleted." });
    }

    private async Task<User?> GetCurrentUserAsync()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userId) || !ObjectId.TryParse(userId, out var objectId))
        {
            return null;
        }

        return await _db.Users.Find(u => u.Id == objectId).FirstOrDefaultAsync();
    }

    private string GenerateToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"];
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        if (string.IsNullOrWhiteSpace(jwtKey) || string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(audience))
        {
            throw new InvalidOperationException("JWT configuration is missing.");
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static AuthUserDto ToAuthUserDto(User user)
    {
        return new AuthUserDto
        {
            Id = user.Id.ToString(),
            FullName = user.FullName,
            Designation = user.Designation,
            Email = user.Email,
            AvgIncome = user.AvgIncome
        };
    }
}
