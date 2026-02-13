using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddCors(option =>
{
    option.AddPolicy("AllowAll", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.MapGet("/api/user", () => 
{
    var users = new[] { 
        new{ID = 1, Name = "Alice"}, 
        new{ID = 2, Name = "Bob"}, 
        new{ID = 3, Name = "Charlie"} 
    };
    return Results.Ok(users);
});

app.Run();