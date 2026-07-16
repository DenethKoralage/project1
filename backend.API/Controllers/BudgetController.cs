using backend.Application.DTOs;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BudgetController : ControllerBase
{
    private readonly IBudgetService _budgetService;

    public BudgetController(IBudgetService budgetService)
    {
        _budgetService = budgetService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BudgetDto>>> GetBudgets()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var budgets = await _budgetService.GetBudgetsByUserIdAsync(userId.Value);
        return Ok(budgets);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BudgetDto>> GetBudget(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var budget = await _budgetService.GetBudgetByIdAsync(id, userId.Value);
        return budget == null ? NotFound() : Ok(budget);
    }

    [HttpGet("summary")]
    public async Task<ActionResult<BudgetDto>> GetBudgetSummary()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var budget = await _budgetService.GetBudgetSummaryAsync(userId.Value);
        return Ok(budget);
    }

    [HttpPost]
    public async Task<ActionResult<BudgetDto>> CreateBudget(BudgetDto budgetDto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var createdBudget = await _budgetService.CreateBudgetAsync(budgetDto, userId.Value);
            return CreatedAtAction(nameof(GetBudget), new { id = createdBudget.Id }, createdBudget);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateBudget(Guid id, BudgetDto budgetDto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var updated = await _budgetService.UpdateBudgetAsync(id, budgetDto, userId.Value);
            return updated ? NoContent() : NotFound();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBudget(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var deleted = await _budgetService.DeleteBudgetAsync(id, userId.Value);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/spent")]
    public async Task<IActionResult> MarkBudgetAsSpent(Guid id)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var updated = await _budgetService.MarkBudgetAsSpentAsync(id, userId.Value);
            return updated ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}
