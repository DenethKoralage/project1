
namespace backend.Application.Interfaces;

public interface IImageStorageService
{
    Task<string> SaveImageAsync(
        string fileName,
        long length,
        Stream stream,
        CancellationToken cancellationToken = default);
    void DeleteImage(string? imagePath);
}
