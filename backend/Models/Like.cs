public class Like
{
    public int Id { get; set; }
    public int PostId { get; set; }
    public string UserId { get; set; } = null!;

    public Post? Post { get; set; }
    public User? User { get; set; }
}