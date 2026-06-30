using backend.Application.DTOs;
using backend.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly IExpenseService _expenseService;

        public ExpenseController(IExpenseService expenseService)
        {
            _expenseService = expenseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetExpenses()
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var expenses = await _expenseService.GetExpensesByUserIdAsync(userId.Value);

            return Ok(expenses);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ExpenseDto>> GetExpense(Guid id)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var expense = await _expenseService.GetExpenseByIdAsync(id, userId.Value);

            if (expense == null)
                return NotFound();

            return Ok(expense);
        }

        [HttpPost]
        public async Task<ActionResult<ExpenseDto>> CreateExpense([FromBody] ExpenseDto expenseDto)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var createdExpense =
                await _expenseService.CreateExpenseAsync(expenseDto, userId.Value);

            return CreatedAtAction(
                nameof(GetExpense),
                new { id = createdExpense.Id },
                createdExpense);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<bool>> UpdateExpense(Guid id, [FromBody] ExpenseDto expenseDto)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var updated = await _expenseService.UpdateExpenseAsync(
                id,
                expenseDto,
                userId.Value);

            if (!updated)
                return NotFound();

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteExpense(Guid id)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var deleted = await _expenseService.DeleteExpenseAsync(id, userId.Value);

            if (!deleted)
                return NotFound();

            return Ok(deleted);
        }

        [HttpGet("total")]
        public async Task<ActionResult<decimal>> GetTotalExpenses()
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var total =
                await _expenseService.GetTotalExpensesByUserIdAsync(userId.Value);

            return Ok(total);
        }

        [HttpGet("total-by-category/{userId}/{category}")]
        public async Task<ActionResult<decimal>> GetTotalExpensesByCategory(
            int userId,
            string category)
        {
            var total =
                await _expenseService
                    .GetTotalExpensesByUserIdAndCategoryAsync(userId, category);

            return Ok(total);
        }

        [HttpGet("total-by-month/{userId}/{month}")]
        public async Task<ActionResult<decimal>> GetTotalExpensesByMonth(
            int userId,
            int month)
        {
            var total =
                await _expenseService
                    .GetTotalExpensesByUserIdAndMonthAsync(userId, month);

            return Ok(total);
        }

        [HttpGet("total-by-year/{userId}/{year}")]
        public async Task<ActionResult<decimal>> GetTotalExpensesByYear(
            int userId,
            int year)
        {
            var total =
                await _expenseService
                    .GetTotalExpensesByUserIdAndYearAsync(userId, year);

            return Ok(total);
        }

        [HttpGet("total-by-category-and-month/{userId}/{category}/{month}")]
        public async Task<ActionResult<decimal>> GetTotalExpensesByCategoryAndMonth(
            int userId,
            string category,
            int month)
        {
            var total =
                await _expenseService
                    .GetTotalExpensesByUserIdAndCategoryAndMonthAsync(
                        userId,
                        category,
                        month);

            return Ok(total);
        }

        [HttpGet("total-by-category-and-year/{userId}/{category}/{year}")]
        public async Task<ActionResult<decimal>> GetTotalExpensesByCategoryAndYear(
            int userId,
            string category,
            int year)
        {
            var total =
                await _expenseService
                    .GetTotalExpensesByUserIdAndCategoryAndYearAsync(
                        userId,
                        category,
                        year);

            return Ok(total);
        }

        [HttpGet("total/{userId}")]
        public async Task<ActionResult<decimal>> GetTotalExpensesByUserId(
            int userId)
        {
            var total =
                await _expenseService.GetTotalExpensesByUserIdAsync(userId);

            return Ok(total);
        }

        [HttpGet("count/{userId}")]
        public async Task<ActionResult<ExpenseDto>> GetExpensesCount(int userId)
        {
            var count = await _expenseService.GetExpensesCountAsync(userId);
            return Ok(count);
        }

        [HttpGet("AllExpensesByUserId/{userId}")]
        public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetAllExpensesByUserId(
            int userId)
        {
            var expenses = await _expenseService.GetAllExpensesByUserIdAsync(userId);
            return Ok(expenses);
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.Claims.FirstOrDefault(
                c => c.Type == ClaimTypes.NameIdentifier);

            return userIdClaim != null &&
                   int.TryParse(userIdClaim.Value, out var userId)
                ? userId
                : (int?)null;
        }
    }
}