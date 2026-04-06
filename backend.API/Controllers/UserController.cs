using Microsoft.AspNetCore.Mvc;
using backend.API.Models;

[ApiController]
[Route("api/[controller]")]
public class UserController : ControllerBase
{
    private readonly IUserRepository _userRepository;
    public UserController(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }
    [HttpGet]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        var users = await _userRepository.GetAllUsersAsync();
        return Ok(users);
    }
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id)
    {
        var user = await _userRepository.GetUserByIdAsync(id);
        if (user == null)
        {
            return NotFound();
        }
        return Ok(user);
    }
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(User user)
    {
        var createdUser = await _userRepository.CreateUserAsync(user);
        return CreatedAtAction(nameof(GetUser), new { id = createdUser.Id }, createdUser);
    }
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, User user)
    {
        if (id != user.Id)
        {
            return BadRequest();
        }
        var existingUser = await _userRepository.GetUserByIdAsync(id);
        if (existingUser == null)
        {
            return NotFound();
        }
        await _userRepository.UpdateUserAsync(user);
        return NoContent();
    }
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var existingUser = await _userRepository.GetUserByIdAsync(id);
        if (existingUser == null)
        {
            return NotFound();
        }
        await _userRepository.DeleteUserAsync(id);
        return NoContent();
    }
}