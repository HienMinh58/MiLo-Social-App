using Microsoft.AspNetCore.Identity;

public class User : IdentityUser
{
    public string? Bio { get; set; }
    public string? Avatar { get; set; }

    //Navigation
    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
    public ICollection<Friend> SentRequests { get; set; } = new List<Friend>();
    public ICollection<Friend> ReceivedRequests { get; set; } = new List<Friend>();
}

