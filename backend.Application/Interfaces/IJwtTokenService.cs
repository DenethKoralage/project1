using backend.Application.DTOs;
using backend.Domain.Entities;

namespace backend.Application.Interfaces;

public interface IJwtTokenService
{
    JwtTokenDto GenerateToken(User user);
}
