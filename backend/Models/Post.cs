using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.ComponentModel.DataAnnotations;

public class Post
{
    public int Id { get; set; }
    public string Content { get; set; } = null!;
    public DateTime CreatedAt { get; set;} = DateTime.UtcNow; 
    public byte[]? ImageData { get; set; }
    public string? ImageContentType { get; set; }
}



