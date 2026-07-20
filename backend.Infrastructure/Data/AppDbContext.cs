using backend.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Budget> Budgets => Set<Budget>();
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<Blog> Blogs => Set<Blog>();
    public DbSet<BlogLike> BlogLikes => Set<BlogLike>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(user => user.Name).HasMaxLength(120);
            entity.Property(user => user.Email).HasMaxLength(256);
            entity.Property(user => user.Password).HasMaxLength(512);
            entity.Property(user => user.Designation).HasMaxLength(120);
            entity.Property(user => user.Workplace).HasMaxLength(120);
            entity.Property(user => user.HomeAddress).HasMaxLength(256);
            entity.Property(user => user.HomeCity).HasMaxLength(120);
            entity.Property(user => user.Country).HasMaxLength(120);
            entity.Property(user => user.Currency).HasMaxLength(10);
            entity.Property(user => user.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(user => user.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasIndex(user => user.Email).IsUnique();
        });

        modelBuilder.Entity<Budget>(entity =>
        {
            entity.Property(budget => budget.Name).HasMaxLength(120);
            entity.Property(budget => budget.Title).HasMaxLength(120);
            entity.Property(budget => budget.Category).HasMaxLength(120);
            entity.Property(budget => budget.Description).HasMaxLength(512);
            entity.Property(budget => budget.Amount).HasPrecision(18, 2);
            entity.Property(budget => budget.TotalBudget).HasPrecision(18, 2);
            entity.Property(budget => budget.RemainingBudget).HasPrecision(18, 2);
            entity.Property(budget => budget.IsSpent).HasDefaultValue(false);

            entity.HasOne(budget => budget.User)
                .WithMany(user => user.Budgets)
                .HasForeignKey(budget => budget.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Expense>(entity =>
        {
            entity.Property(expense => expense.Amount).HasPrecision(18, 2);
            entity.Property(expense => expense.Category).HasMaxLength(120);
            entity.Property(expense => expense.Description).HasMaxLength(512);

            entity.HasOne(expense => expense.User)
                .WithMany(user => user.Expenses)
                .HasForeignKey(expense => expense.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Income>(entity =>
        {
            entity.Property(income => income.Amount).HasPrecision(18, 2);
            entity.Property(income => income.Description).HasMaxLength(512);
            entity.Property(income => income.Category).HasMaxLength(120);
            entity.Property(income => income.Source).HasMaxLength(120);
            entity.Property(income => income.IncomeDate).HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(income => income.User)
                .WithMany(user => user.Incomes)
                .HasForeignKey(income => income.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Blog>(entity =>
        {
            entity.Property(blog => blog.Title).HasMaxLength(180);
            entity.Property(blog => blog.Category).HasMaxLength(120);
            entity.Property(blog => blog.Excerpt).HasMaxLength(512);
            entity.Property(blog => blog.Image).HasMaxLength(512);
            entity.Property(blog => blog.Author).HasMaxLength(120);
            entity.Property(blog => blog.CreatedAt).HasDefaultValueSql("SYSUTCDATETIME()");
            entity.Property(blog => blog.UpdatedAt).HasDefaultValueSql("SYSUTCDATETIME()");

            entity.HasOne(blog => blog.User)
                .WithMany(user => user.Blogs)
                .HasForeignKey(blog => blog.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BlogLike>(entity =>
        {
            // Composite primary key prevents double-likes at the DB level
            entity.HasKey(like => new { like.BlogId, like.UserId });

            entity.HasOne(like => like.Blog)
                .WithMany(blog => blog.Likes)
                .HasForeignKey(like => like.BlogId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(like => like.User)
                .WithMany(user => user.BlogLikes)
                .HasForeignKey(like => like.UserId)
                .OnDelete(DeleteBehavior.NoAction); // avoid multiple cascade paths through User
        });
    }
}
