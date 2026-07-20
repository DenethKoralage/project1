using backend.Application.Interfaces;
using backend.Domain.Entities;
using backend.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace backend.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogController : ControllerBase
{
    private readonly AppDbContext _dbContext;
    private readonly IImageStorageService _imageStorageService;

    public BlogController(AppDbContext dbContext, IImageStorageService imageStorageService)
    {
        _dbContext = dbContext;
        _imageStorageService = imageStorageService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BlogDto>>> GetBlogs()
    {
        var blogs = await _dbContext.Blogs
            .AsNoTracking()
            .Include(blog => blog.User)
            .OrderByDescending(blog => blog.CreatedAt)
            .Select(blog => ToDto(blog))
            .ToListAsync();

        return Ok(blogs);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BlogDto>> GetBlog(Guid id)
    {
        var blog = await _dbContext.Blogs
            .AsNoTracking()
            .Include(item => item.User)
            .FirstOrDefaultAsync(item => item.Id == id);

        return blog is null ? NotFound() : Ok(ToDto(blog));
    }

    [Authorize]
    [HttpPost]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<BlogDto>> CreateBlog([FromForm] CreateBlogRequest request)
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
                HttpContext.RequestAborted);
        }

        var user = await _dbContext.Users.FindAsync([userId.Value], HttpContext.RequestAborted);
        var blog = new Blog
        {
            Id = Guid.NewGuid(),
            Title = request.Title.Trim(),
            Category = string.IsNullOrWhiteSpace(request.Category) ? "General" : request.Category.Trim(),
            Excerpt = request.Excerpt.Trim(),
            Content = request.Content.Trim(),
            Image = imagePath ?? "/f4.png",
            Author = user?.Name ?? "Community Writer",
            UserId = userId.Value,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _dbContext.Blogs.Add(blog);
        await _dbContext.SaveChangesAsync(HttpContext.RequestAborted);

        blog.User = user!;
        var dto = ToDto(blog);
        return CreatedAtAction(nameof(GetBlog), new { id = blog.Id }, dto);
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        return userIdClaim != null && int.TryParse(userIdClaim.Value, out var userId)
            ? userId
            : null;
    }

    private static BlogDto ToDto(Blog blog) =>
        new(
            blog.Id,
            blog.Title,
            blog.Category,
            blog.Excerpt,
            blog.Content,
            blog.Image ?? "/f4.png",
            string.IsNullOrWhiteSpace(blog.Author) ? blog.User?.Name ?? "Community Writer" : blog.Author,
            blog.CreatedAt
        );
}

public class CreateBlogRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Category { get; set; }
    public string Excerpt { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public IFormFile? Image { get; set; }
}

public record BlogDto(
    Guid Id,
    string Title,
    string Category,
    string Excerpt,
    string Content,
    string Image,
    string Author,
    DateTime PublishedAt
);
