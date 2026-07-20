using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Infrastructure.Repositories;

public class BlogRepository : IBlogRepository
{
    private readonly AppDbContext _db;

    public BlogRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<BlogDto>> GetBlogsAsync(BlogQueryDto query, CancellationToken ct = default)
    {
        var q = _db.Blogs.AsNoTracking().Include(b => b.Likes).AsQueryable();

        // 1. Scope to user
        if (query.UserId.HasValue)
            q = q.Where(b => b.UserId == query.UserId.Value);

        // 2. Category filter
        if (!string.IsNullOrWhiteSpace(query.Category))
            q = q.Where(b => b.Category == query.Category);

        // 3. Search (case-insensitive partial match on Title or Content)
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var term = query.Search.Trim().ToLower();
            q = q.Where(b =>
                b.Title.ToLower().Contains(term) ||
                b.Content.ToLower().Contains(term));
        }

        // 4. Sorting
        q = (query.Sort?.ToLower() == "oldest")
            ? q.OrderBy(b => b.CreatedAt)
            : q.OrderByDescending(b => b.CreatedAt);

        var blogs = await q.Include(b => b.User).ToListAsync(ct);

        return blogs.Select(b => ToDto(b, query.CurrentUserId));
    }

    public async Task<BlogDto?> GetBlogByIdAsync(Guid id, int? currentUserId, CancellationToken ct = default)
    {
        var blog = await _db.Blogs
            .AsNoTracking()
            .Include(b => b.User)
            .Include(b => b.Likes)
            .FirstOrDefaultAsync(b => b.Id == id, ct);

        return blog is null ? null : ToDto(blog, currentUserId);
    }

    public async Task<Blog> CreateBlogAsync(Blog blog, CancellationToken ct = default)
    {
        _db.Blogs.Add(blog);
        await _db.SaveChangesAsync(ct);
        return blog;
    }

    public async Task<BlogLikeDto> ToggleLikeAsync(Guid blogId, int userId, CancellationToken ct = default)
    {
        var existing = await _db.BlogLikes
            .FirstOrDefaultAsync(l => l.BlogId == blogId && l.UserId == userId, ct);

        if (existing is not null)
        {
            _db.BlogLikes.Remove(existing);
        }
        else
        {
            _db.BlogLikes.Add(new BlogLike
            {
                BlogId = blogId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            });
        }

        await _db.SaveChangesAsync(ct);

        return await GetLikeSummaryAsync(blogId, userId, ct);
    }

    public async Task<BlogLikeDto> GetLikeSummaryAsync(Guid blogId, int? currentUserId, CancellationToken ct = default)
    {
        var likes = await _db.BlogLikes
            .AsNoTracking()
            .Where(l => l.BlogId == blogId)
            .ToListAsync(ct);

        var count = likes.Count;
        var isLiked = currentUserId.HasValue && likes.Any(l => l.UserId == currentUserId.Value);

        return new BlogLikeDto(count, isLiked);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private static BlogDto ToDto(Blog blog, int? currentUserId) => new(
        blog.Id,
        blog.Title,
        blog.Category,
        blog.Excerpt,
        blog.Content,
        blog.Image ?? "/f4.png",
        string.IsNullOrWhiteSpace(blog.Author) ? blog.User?.Name ?? "Community Writer" : blog.Author,
        blog.UserId,
        blog.CreatedAt,
        blog.Likes.Count,
        currentUserId.HasValue && blog.Likes.Any(l => l.UserId == currentUserId.Value)
    );
}
