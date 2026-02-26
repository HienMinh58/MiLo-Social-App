public class Comment
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string UserId { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string Content { get; set; } = null!;

    public Post Post { get; set; } = null!;
    public User User { get; set; } = null!;
}