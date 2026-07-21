using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;

namespace backend.Application.Services;

public class BlogService : IBlogService
{
    private readonly IBlogRepository _blogRepository;

    public BlogService(IBlogRepository blogRepository)
    {
        _blogRepository = blogRepository;
    }

    public async Task<IEnumerable<BlogDto>> GetBlogsAsync(BlogQueryDto query, CancellationToken ct = default)
        => await _blogRepository.GetBlogsAsync(query, ct);

    public async Task<BlogDto?> GetBlogByIdAsync(Guid id, int? currentUserId, CancellationToken ct = default)
        => await _blogRepository.GetBlogByIdAsync(id, currentUserId, ct);

    public async Task<BlogDto> CreateBlogAsync(Blog blog, CancellationToken ct = default)
    {
        var created = await _blogRepository.CreateBlogAsync(blog, ct);
        // Re-fetch to get like counts (always 0 on creation, but keeps the shape consistent)
        return await _blogRepository.GetBlogByIdAsync(created.Id, blog.UserId, ct)
               ?? throw new InvalidOperationException("Blog not found after creation.");
    }

    public async Task<BlogLikeDto> ToggleLikeAsync(Guid blogId, int userId, CancellationToken ct = default)
        => await _blogRepository.ToggleLikeAsync(blogId, userId, ct);

    public async Task<BlogLikeDto> GetLikeSummaryAsync(Guid blogId, int? currentUserId, CancellationToken ct = default)
        => await _blogRepository.GetLikeSummaryAsync(blogId, currentUserId, ct);

    public async Task DeleteBlogAsync(Guid blogId, int? currentUserId, CancellationToken ct = default)
        => await _blogRepository.DeleteBlogAsync(blogId, currentUserId, ct);
}
