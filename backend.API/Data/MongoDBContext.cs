using backend.API.Models;
using MongoDB.Driver;

namespace backend.API.Data;

public class MongoDBContext
{
    private readonly IMongoDatabase _database;

    public MongoDBContext(IConfiguration configuration)
    {
        var connectionString = configuration.GetSection("MongoDB:ConnectionString").Value;
        var databaseName = configuration.GetSection("MongoDB:DatabaseName").Value;

        var client = new MongoClient(connectionString);
        _database = client.GetDatabase(databaseName);
    }

    public IMongoCollection<Expense> Expenses => _database.GetCollection<Expense>("Expenses");
    public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
}
