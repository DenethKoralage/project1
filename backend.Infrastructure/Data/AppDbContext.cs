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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(user => user.Name).HasMaxLength(120);
            entity.Property(user => user.Email).HasMaxLength(256);
            entity.Property(user => user.Password).HasMaxLength(512);
            entity.Property(user => user.Designation).HasMaxLength(120);
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

            entity.HasOne(budget => budget.User)
                .WithMany(user => user.Budgets)
                .HasForeignKey(budget => budget.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Expense>()
            .Property(expense => expense.Amount)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Income>()
            .Property(income => income.Amount)
            .HasPrecision(18, 2);
    }
}
