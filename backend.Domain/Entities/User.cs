namespace backend.Domain.Entities;

public class User
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Designation { get; set; } = string.Empty;
    public string Workplace { get; set; } = string.Empty;
    public string HomeAddress { get; set; } = string.Empty;
    public string HomeCity { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Currency { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<Expense> Expenses { get; set; } = new List<Expense>();
    public List<Budget> Budgets { get; set; } = new List<Budget>();
    public List<Income> Incomes { get; set; } = new List<Income>();
    public List<Blog> Blogs { get; set; } = new List<Blog>();
    public List<BlogLike> BlogLikes { get; set; } = new();

}
