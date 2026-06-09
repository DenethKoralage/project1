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
    public class IncomeController : ControllerBase
    {
        private readonly IIncomeService _incomeService;

        public IncomeController(IIncomeService incomeService)
        {
            _incomeService = incomeService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<IncomeDto>>> GetIncomes()
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var incomes = await _incomeService.GetIncomesByUserIdAsync(userId.Value);

            return Ok(incomes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<IncomeDto>> GetIncome(Guid id)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var income = await _incomeService.GetIncomeByIdAsync(id, userId.Value);

            if (income == null)
                return NotFound();

            return Ok(income);
        }

        [HttpPost]
        public async Task<ActionResult<IncomeDto>> CreateIncome([FromBody] IncomeDto incomeDto)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var createdIncome =
                await _incomeService.CreateIncomeAsync(incomeDto, userId.Value);

            return CreatedAtAction(
                nameof(GetIncome),
                new { id = createdIncome.Id },
                createdIncome);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<bool>> UpdateIncome(Guid id, [FromBody] IncomeDto incomeDto)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var updated = await _incomeService.UpdateIncomeAsync(
                id,
                incomeDto,
                userId.Value);

            if (!updated)
                return NotFound();

            return Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<bool>> DeleteIncome(Guid id)
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var deleted = await _incomeService.DeleteIncomeAsync(id, userId.Value);

            if (!deleted)
                return NotFound();

            return Ok(deleted);
        }

        [HttpGet("total")]
        public async Task<ActionResult<decimal>> GetTotalIncomes()
        {
            var userId = GetCurrentUserId();

            if (userId == null)
                return Unauthorized();

            var total =
                await _incomeService.GetTotalIncomesByUserIdAsync(userId.Value);

            return Ok(total);
        }

        [HttpGet("total-by-category/{userId}/{category}")]
        public async Task<ActionResult<decimal>> GetTotalIncomesByCategory(
            int userId,
            string category)
        {
            var total =
                await _incomeService
                    .GetTotalIncomesByUserIdAndCategoryAsync(userId, category);

            return Ok(total);
        }

        [HttpGet("total-by-month/{userId}/{month}")]
        public async Task<ActionResult<decimal>> GetTotalIncomesByMonth(
            int userId,
            int month)
        {
            var total =
                await _incomeService
                    .GetTotalIncomesByUserIdAndMonthAsync(userId, month);

            return Ok(total);
        }

        [HttpGet("total-by-year/{userId}/{year}")]
        public async Task<ActionResult<decimal>> GetTotalIncomesByYear(
            int userId,
            int year)
        {
            var total =
                await _incomeService
                    .GetTotalIncomesByUserIdAndYearAsync(userId, year);

            return Ok(total);
        }

        [HttpGet("total-by-category-and-month/{userId}/{category}/{month}")]
        public async Task<ActionResult<decimal>> GetTotalIncomesByCategoryAndMonth(
            int userId,
            string category,
            int month)
        {
            var total =
                await _incomeService
                    .GetTotalIncomesByUserIdAndCategoryAndMonthAsync(
                        userId,
                        category,
                        month);

            return Ok(total);
        }

        [HttpGet("total-by-category-and-year/{userId}/{category}/{year}")]
        public async Task<ActionResult<decimal>> GetTotalIncomesByCategoryAndYear(
            int userId,
            string category,
            int year)
        {
            var total =
                await _incomeService
                    .GetTotalIncomesByUserIdAndCategoryAndYearAsync(
                        userId,
                        category,
                        year);

            return Ok(total);
        }

        [HttpGet("total/{userId}")]
        public async Task<ActionResult<decimal>> GetTotalIncomesByUserId(
            int userId)
        {
            var total =
                await _incomeService.GetTotalIncomesByUserIdAsync(userId);

            return Ok(total);
        }

        [HttpGet("count/{userId}")]
        public async Task<ActionResult<IncomeDto>> GetIncomesCount(int userId)
        {
            var count = await _incomeService.GetIncomesCountAsync(userId);
            return Ok(count);
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