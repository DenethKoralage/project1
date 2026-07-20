namespace backend.Domain.Entities;

public class BlogLike
{
    public Guid BlogId { get; set; }
    public Blog Blog { get; set; } = null!;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
