using backend.Application.DTOs;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IUserService _userService;

    public UserController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        try
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving the users.");
        }
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        try
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving the user.");
        }
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<UserDto>> CreateUser(UserDto userDto)
    {
        try
        {
            var createdUser = await _userService.CreateUserAsync(userDto);
            return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while creating the user.");
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateUser(int id, UpdateUserDto userDto)
    {
        try
        {
            var updated = await _userService.UpdateUserAsync(id, userDto);
            if (!updated)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while updating the user.");
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        try
        {
            var deleted = await _userService.DeleteUserAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while deleting the user.");
        }
    }

    [HttpGet("count")]
    public async Task<ActionResult<int>> GetUsersCount()
    {
        try
        {
            var count = await _userService.GetUsersCountAsync();
            return Ok(count);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving the users count.");
        }
    }

    [HttpGet("designation/{designation}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersByDesignation(string designation)
    {
        try
        {
            var users = await _userService.GetUsersByDesignationAsync(designation);
            return Ok(users);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving users by designation.");
        }
    }

    [HttpGet("income/above/{incomeThreshold:decimal}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersWithIncomeAbove(decimal incomeThreshold)
    {
        try
        {
            var users = await _userService.GetUsersWithIncomeAboveAsync(incomeThreshold);
            return Ok(users);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving users by income.");
        }
    }

    [HttpGet("income/below/{incomeThreshold:decimal}")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersWithIncomeBelow(decimal incomeThreshold)
    {
        try
        {
            var users = await _userService.GetUsersWithIncomeBelowAsync(incomeThreshold);
            return Ok(users);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving users by income.");
        }
    }

    [HttpGet("income/between")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersWithIncomeBetween(
        [FromQuery] decimal minIncome,
        [FromQuery] decimal maxIncome)
    {
        try
        {
            var users = await _userService.GetUsersWithIncomeBetweenAsync(minIncome, maxIncome);
            return Ok(users);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving users by income.");
        }
    }

    [HttpGet("income/above-average")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersWithIncomeAboveAverage()
    {
        try
        {
            var users = await _userService.GetUsersWithIncomeAboveAverageAsync();
            return Ok(users);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving users above average income.");
        }
    }

    [HttpGet("income/below-average")]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsersWithIncomeBelowAverage()
    {
        try
        {
            var users = await _userService.GetUsersWithIncomeBelowAverageAsync();
            return Ok(users);
        }
        catch (Exception)
        {
            return StatusCode(500, "An error occurred while retrieving users below average income.");
        }
    }
}
