using Microsoft.AspNetCore.Identity;

public class User : IdentityUser
{
    public string? Bio { get; set; }
    public string? Avatar { get; set; }

    //Navigation
    public ICollection<Friend> SentRequests { get; set; } = new List<Friend>();
    public ICollection<Friend> ReceivedRequests { get; set; } = new List<Friend>();
}

