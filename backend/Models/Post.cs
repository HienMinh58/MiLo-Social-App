using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

public class Post
{
    public int Id { get; set; }
    public string Content { get; set; } = null!;
    public string UserId { get; set; } = null!;
    public DateTime CreatedAt { get; set;} = DateTime.UtcNow; 
    public byte[]? ImageData { get; set; }
    public string? ImageContentType { get; set; }

    public User User { get; set; } = null!;
    public ICollection<Like> Likes { get; set; } = new List<Like>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();
}



