using backend.Application.Interfaces;

namespace backend.Infrastructure.Services;

public class LocalImageStorageService : IImageStorageService
{
    private readonly string _uploadRoot;
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif"
    };
    private const long MaxFileSizeBytes = 5 * 1024 * 1024; // 5 MB

    public LocalImageStorageService(Microsoft.AspNetCore.Hosting.IWebHostEnvironment env)
    {
        var webRootPath = env.WebRootPath ?? Path.Combine(env.ContentRootPath, "wwwroot");
        _uploadRoot = Path.Combine(webRootPath, "uploads", "blogs");
        Directory.CreateDirectory(_uploadRoot);
    }

    public async Task<string> SaveImageAsync(
        string originalFileName,
        long length,
        Stream source,
        CancellationToken cancellationToken = default)
    {
        var ext = Path.GetExtension(originalFileName);
        if (!AllowedExtensions.Contains(ext))
            throw new InvalidOperationException("Unsupported image type.");

        if (length > MaxFileSizeBytes)
            throw new InvalidOperationException("Image exceeds 5MB limit.");

        var fileName = $"{Guid.NewGuid()}{ext}";
        var fullPath = Path.Combine(_uploadRoot, fileName);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await source.CopyToAsync(stream, cancellationToken);

        return $"/uploads/blogs/{fileName}";
    }

    public void DeleteImage(string? imagePath)
    {
        if (string.IsNullOrWhiteSpace(imagePath)) return;
        var fullPath = Path.Combine(_uploadRoot, Path.GetFileName(imagePath));
        if (File.Exists(fullPath)) File.Delete(fullPath);
    }
}
