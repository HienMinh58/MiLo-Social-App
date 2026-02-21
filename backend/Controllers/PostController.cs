using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using Microsoft.AspNetCore.Authentication.JwtBearer;

[Route("api/[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class PostController : ControllerBase
{
    private readonly AppDbContext _context;

    public PostController(AppDbContext context)
    {
        _context = context;
    }
    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var post = new Post
        {
            UserId = userId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };
        _context.Posts.Add(post);
        await _context.SaveChangesAsync();
        return Ok(post);
    }
    [HttpGet]
    public async Task<IActionResult> GetFeed()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var friendIdList = await _context.Friends
            .Where(f => f.RequesterId == userId && f.FriendStatus == FriendStatus.Accepted)
            .Select(f => f.AddresseeId)
            .ToListAsync();

        friendIdList.Add(userId);

        var posts = _context.Posts
            .Where(p => friendIdList.Contains(p.UserId))
            .Include(p => p.User)
            .Include(p => p.Comments)
            .Include(p => p.Likes).ThenInclude(c => c.User)
            .OrderByDescending(p => p.Likes.Count)
            .Select(p => new
            {
                p.Id,
                p.Content,
                p.CreatedAt,
                User = new { p.UserId, p.User.UserName, p.User.Email },
                likesCount = p.Likes.Count,
                isLikedByMe = p.Likes.Any(l => l.UserId == userId),
                Comments = p.Comments.Select(c => new
                {
                    c.Id,
                    c.Content,
                    c.CreatedAt,
                    User = new { c.User.Id, c.User.UserName }
                }).OrderBy(c => c.CreatedAt).ToList()
            })
            .ToListAsync();
        return Ok(posts);
    }
}

public class CreatePostDto
{
    public string Content { get; set; } = null!;
}

public class CreateCommentDto
{
    public string Content { get; set; } = null!;
}
