namespace backend.Application.DTOs;

public record BlogDto(
    Guid Id,
    string Title,
    string Category,
    string Excerpt,
    string Content,
    string Image,
    string Author,
    int AuthorId,
    DateTime PublishedAt,
    int LikeCount,
    bool IsLikedByMe
);

public record BlogLikeDto(int LikeCount, bool IsLikedByMe);

public record CreateBlogDto(
    string Title,
    string? Category,
    string Excerpt,
    string Content,
    string? ImagePath
);

public record BlogQueryDto(
    int? UserId,      // when set, only return blogs by this user
    string? Category,
    string? Sort,     // "newest" (default) | "oldest"
    string? Search,   // partial match on Title or Content
    int? CurrentUserId // for computing IsLikedByMe
);
