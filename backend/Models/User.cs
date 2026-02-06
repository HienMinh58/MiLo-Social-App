using Microsoft.AspNetCore.Identity;

public class User : IdentityUser
{
    public string? Bio { get; set; }
    public byte[]? Avatar { get; set; }
}