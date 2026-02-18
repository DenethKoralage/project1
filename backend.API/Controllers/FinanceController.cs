using backend.API.Data;
using backend.API.Models;
using backend.API.Contracts.Finance;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using MongoDB.Driver;
using System.Security.Claims;
using System.Globalization;

namespace backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FinanceController : ControllerBase
{
    private readonly MongoDBContext _db;
    private readonly ILogger<FinanceController> _logger;

    public FinanceController(MongoDBContext db, ILogger<FinanceController> logger)
    {
        _db = db;
        _logger = logger;
    }

    // ==============================
    // ADD EXPENSE
    // ==============================
    [HttpPost("add-expense")]
    [HttpPost("monthly-usual-expenses")]
    [Authorize]
    public async Task<ActionResult> AddExpense([FromBody] AddMonthlyExpenseRequest request)
    {
        if (request == null)
        {
            return BadRequest(new { message = "Invalid request." });
        }

        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
        {
            return Unauthorized(new { message = "User ID claim is missing." });
        }

        var expense = new Expense
        {
            Id = ObjectId.GenerateNewId(),
            Amount = request.Amount,
            Description = request.Description,
            Date = request.Month,
            UserId = userId, // stored as string
            Category = request.Category
        };

        await _db.Expenses.InsertOneAsync(expense);

        return Ok(new { message = "Expense added successfully." });
    }

    // ==============================
    // GET MONTHLY EXPENSES
    // ==============================
    [HttpGet("monthly-usual-expenses")]
    [Authorize]
    public async Task<ActionResult> GetMonthlyUsualExpenses([FromQuery] string month)
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(userIdString))
        {
            return Unauthorized(new { message = "User ID claim is missing." });
        }

        if (!TryParseMonth(month, out var monthStartUtc))
        {
            return BadRequest(new { message = "Invalid month format. Use YYYY-MM." });
        }

        var monthEndUtc = monthStartUtc.AddMonths(1);

        var expenses = await _db.Expenses.Find(e =>
                e.UserId == userIdString &&
                e.Date >= monthStartUtc &&
                e.Date < monthEndUtc)
            .SortBy(e => e.Date)
            .ToListAsync();

        var response = expenses.Select(e => new
        {
            id = e.Id.ToString(),
            category = e.Category ?? string.Empty,
            description = e.Description ?? string.Empty,
            amount = e.Amount,
            month = new DateTime(e.Date.Year, e.Date.Month, 1, 0, 0, 0, DateTimeKind.Utc)
        });

        return Ok(response);
    }

    // ==============================
    // GET NEXT MONTH PREDICTION
    // ==============================
    [HttpGet("prediction/next-month")]
    [Authorize]
    public async Task<ActionResult> GetNextMonthPrediction()
    {
        try
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrWhiteSpace(userIdString))
            {
                return Unauthorized(new { message = "User ID claim is missing." });
            }

            var rawExpenses = _db.Expenses.Database.GetCollection<BsonDocument>("Expenses");
            var filters = new List<FilterDefinition<BsonDocument>>
            {
                Builders<BsonDocument>.Filter.Eq("userId", userIdString)
            };

            if (ObjectId.TryParse(userIdString, out var userObjectId))
            {
                filters.Add(Builders<BsonDocument>.Filter.Eq("userId", userObjectId));
            }

            var docs = await rawExpenses
                .Find(Builders<BsonDocument>.Filter.Or(filters))
                .ToListAsync();

            var normalizedExpenses = docs
                .Select(doc =>
                {
                    if (!doc.TryGetValue("category", out var categoryValue) ||
                        categoryValue.IsBsonNull ||
                        !TryReadDateMonthStart(doc, out var monthStart) ||
                        !TryReadDecimal(doc, out var amount))
                    {
                        return null;
                    }

                    var category = categoryValue.IsString ? categoryValue.AsString : categoryValue.ToString();
                    if (string.IsNullOrWhiteSpace(category))
                    {
                        return null;
                    }

                    return new
                    {
                        Month = monthStart,
                        Category = category.Trim(),
                        Amount = amount
                    };
                })
                .Where(x => x != null)!
                .Select(x => x!)
                .ToList();

            var monthlyByCategory = normalizedExpenses
                .GroupBy(e => new { e.Month, e.Category })
                .Select(g => new
                {
                    g.Key.Month,
                    g.Key.Category,
                    Amount = g.Sum(x => x.Amount)
                })
                .ToList();

            var items = monthlyByCategory
                .GroupBy(x => x.Category)
                .Select(g =>
                {
                    var monthlyAmounts = g
                        .OrderByDescending(x => x.Month)
                        .Take(3)
                        .Select(x => x.Amount)
                        .ToList();

                    var average = monthlyAmounts.Count == 0 ? 0 : monthlyAmounts.Average();
                    return new
                    {
                        category = g.Key,
                        predictedAmount = decimal.Round(average, 2),
                        recentAverage = decimal.Round(average, 2),
                        sourceMonthsCount = monthlyAmounts.Count
                    };
                })
                .OrderByDescending(x => x.predictedAmount)
                .ToList();

            var now = DateTime.UtcNow;
            var predictedMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1);

            return Ok(new
            {
                predictedMonth,
                totalPredicted = items.Sum(x => x.predictedAmount),
                items
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to generate next-month prediction.");
            return Ok(new
            {
                predictedMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc).AddMonths(1),
                totalPredicted = 0m,
                items = Array.Empty<object>()
            });
        }
    }

    // ==============================
    // GET REMAINING BUDGET
    // ==============================
    [HttpGet("get-remaining-budget")]
    [Authorize]
    public async Task<ActionResult> GetRemainingBudget()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized(new { message = "User ID claim is missing." });
        }

        // Validate ObjectId safely
        if (!ObjectId.TryParse(userIdString, out ObjectId userId))
        {
            return Unauthorized(new { message = "Invalid User ID format." });
        }

        var user = await _db.Users
            .Find(u => u.Id == userId)
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User not found." });
        }

        var totalExpenses = await _db.Expenses.Aggregate()
            .Match(e => e.UserId == userIdString)
            .Group(e => e.UserId,
                g => new
                {
                    UserId = g.Key,
                    TotalAmount = g.Sum(x => x.Amount)
                })
            .FirstOrDefaultAsync();

        var remainingBudget =
            user.AvgIncome - (totalExpenses?.TotalAmount ?? 0);

        return Ok(new { remainingBudget });
    }

    private static bool TryParseMonth(string month, out DateTime monthStartUtc)
    {
        monthStartUtc = default;
        if (string.IsNullOrWhiteSpace(month))
        {
            return false;
        }

        var normalized = $"{month}-01";
        if (!DateTime.TryParseExact(
                normalized,
                "yyyy-MM-dd",
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal,
                out var parsed))
        {
            return false;
        }

        monthStartUtc = new DateTime(parsed.Year, parsed.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        return true;
    }

    private static bool TryReadDateMonthStart(BsonDocument doc, out DateTime monthStart)
    {
        monthStart = default;
        if (!doc.TryGetValue("date", out var dateValue) || dateValue.IsBsonNull)
        {
            return false;
        }

        DateTime date;
        if (dateValue.IsValidDateTime)
        {
            date = dateValue.ToUniversalTime();
        }
        else if (dateValue.IsString && DateTime.TryParse(dateValue.AsString, out var parsed))
        {
            date = parsed.ToUniversalTime();
        }
        else
        {
            return false;
        }

        monthStart = new DateTime(date.Year, date.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        return true;
    }

    private static bool TryReadDecimal(BsonDocument doc, out decimal amount)
    {
        amount = 0;
        if (!doc.TryGetValue("amount", out var amountValue) || amountValue.IsBsonNull)
        {
            return false;
        }

        switch (amountValue.BsonType)
        {
            case BsonType.Decimal128:
                amount = Decimal128.ToDecimal(amountValue.AsDecimal128);
                return true;
            case BsonType.Double:
                amount = Convert.ToDecimal(amountValue.AsDouble);
                return true;
            case BsonType.Int32:
                amount = amountValue.AsInt32;
                return true;
            case BsonType.Int64:
                amount = amountValue.AsInt64;
                return true;
            case BsonType.String:
                return decimal.TryParse(amountValue.AsString, out amount);
            default:
                return false;
        }
    }
}
