using backend.Application.DTOs;
using backend.Domain.Entities;

namespace backend.Application.Interfaces;

public interface IBlogRepository
{
    Task<IEnumerable<BlogDto>> GetBlogsAsync(BlogQueryDto query, CancellationToken ct = default);
    Task<BlogDto?> GetBlogByIdAsync(Guid id, int? currentUserId, CancellationToken ct = default);
    Task<Blog> CreateBlogAsync(Blog blog, CancellationToken ct = default);
    Task<BlogLikeDto> ToggleLikeAsync(Guid blogId, int userId, CancellationToken ct = default);
    Task<BlogLikeDto> GetLikeSummaryAsync(Guid blogId, int? currentUserId, CancellationToken ct = default);
    Task<Blog> DeleteBlogAsync(Guid blogId, int? currentUserId, CancellationToken ct = default);
}
