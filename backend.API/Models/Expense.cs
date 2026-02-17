using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace backend.API.Models
{
    public class Expense
    {
        [BsonId]
        public ObjectId Id { get; set; }

        [BsonElement("amount")]
        public decimal Amount { get; set; }

        [BsonElement("description")]
        public string? Description { get; set; }

        [BsonElement("date")]
        public DateTime Date { get; set; }

        [BsonElement("category")]
        public string? Category { get; set; }
    }
}
