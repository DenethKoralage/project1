using backend.Application.DTOs;
using backend.Application.Interfaces;
using backend.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogController : ControllerBase
{
    private readonly IBlogService _blogService;
    private readonly IImageStorageService _imageStorageService;

    public BlogController(IBlogService blogService, IImageStorageService imageStorageService)
    {
        _blogService = blogService;
        _imageStorageService = imageStorageService;
    }

    /// <summary>
    /// GET /api/blog
    /// Query params: category, sort (newest|oldest), search, mine (true = scope to current user)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogDto>>> GetBlogs(
        [FromQuery] string? category,
        [FromQuery] string? sort,
        [FromQuery] string? search,
        [FromQuery] bool mine = false,
        CancellationToken ct = default)
    {
        var currentUserId = GetCurrentUserId();

        var query = new BlogQueryDto(
            UserId: mine ? currentUserId : null,
            Category: category,
            Sort: sort,
            Search: search,
            CurrentUserId: currentUserId
        );

        var blogs = await _blogService.GetBlogsAsync(query, ct);
        return Ok(blogs);
    }

    /// <summary>
    /// GET /api/blog/{id}
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BlogDto>> GetBlog(Guid id, CancellationToken ct = default)
    {
        var currentUserId = GetCurrentUserId();
        var blog = await _blogService.GetBlogByIdAsync(id, currentUserId, ct);
        return blog is null ? NotFound() : Ok(blog);
    }

    /// <summary>
    /// POST /api/blog  (multipart/form-data)
    /// </summary>
    [Authorize]
    [HttpPost]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<BlogDto>> CreateBlog(
        [FromForm] CreateBlogRequest request,
        CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Title) ||
            string.IsNullOrWhiteSpace(request.Excerpt) ||
            string.IsNullOrWhiteSpace(request.Content))
        {
            return BadRequest(new { message = "Title, excerpt, and content are required." });
        }

        string? imagePath = null;
        if (request.Image is { Length: > 0 })
        {
            await using var imageStream = request.Image.OpenReadStream();
            imagePath = await _imageStorageService.SaveImageAsync(
                request.Image.FileName,
                request.Image.Length,
                imageStream,
                ct);
        }

        // Resolve author name from JWT claims (name claim set during login)
        var authorName = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value
                         ?? "Community Writer";

        var blog = new Blog
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim(),
            Excerpt = request.Excerpt.Trim(),
            Content = request.Content.Trim(),
            Image = imagePath ?? "/f4.png",
            Author = authorName,
            UserId = userId.Value,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var dto = await _blogService.CreateBlogAsync(blog, ct);
        return CreatedAtAction(nameof(GetBlog), new { id = dto.Id }, dto);
    }

    /// <summary>
    /// POST /api/blog/{id}/like  — toggles like (like if not liked, unlike if already liked)
    /// </summary>
    [Authorize]
    [HttpPost("{id:guid}/like")]
    public async Task<ActionResult<BlogLikeDto>> ToggleLike(Guid id, CancellationToken ct = default)
    {
        var userId = GetCurrentUserId();
        if (userId is null) return Unauthorized();

        var result = await _blogService.ToggleLikeAsync(id, userId.Value, ct);
        return Ok(result);
    }

    /// <summary>
    /// GET /api/blog/{id}/likes  — returns like count and whether current user has liked
    /// </summary>
    [HttpGet("{id:guid}/likes")]
    public async Task<ActionResult<BlogLikeDto>> GetLikes(Guid id, CancellationToken ct = default)
    {
        var currentUserId = GetCurrentUserId();
        var result = await _blogService.GetLikeSummaryAsync(id, currentUserId, ct);
        return Ok(result);
    }

    /// <summary>
    /// DELETE /api/blog/{id} — only the blog's creator can delete it
    /// </summary>
    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteBlogById(Guid id, CancellationToken ct = default)
    {
        var currentUserId = GetCurrentUserId();
        if (currentUserId is null) return Unauthorized();

        var blog = await _blogService.GetBlogByIdAsync(id, currentUserId, ct);
        if (blog is null) return NotFound();

        // Only the creator may delete their own blog
        if (blog.AuthorId != currentUserId.Value)
            return Forbid();

        await _blogService.DeleteBlogAsync(id, currentUserId, ct);

        return NoContent();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private int? GetCurrentUserId()
    {
        var claim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }
}

// ── request model (kept in same file for locality) ───────────────────────────

public class CreateBlogRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string Excerpt { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }
}
