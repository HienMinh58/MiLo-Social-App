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

        await _context.Entry(post).Reference(p => p.User).LoadAsync();

        return Ok(new
        {
            post.Id,
            post.Content,
            post.CreatedAt,
            User = new { post.User.Id, post.User.UserName, post.User.Email, post.User.Avatar },
            likesCount = 0,
            isLikedByMe = false,
            Comments = new List<Comment>(),
        });
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

        var posts = await _context.Posts
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
                User = new { p.User.Id, p.User.UserName, p.User.Email, p.User.Avatar },
                likesCount = p.Likes.Count,
                isLikedByMe = p.Likes.Any(l => l.UserId == userId),
                Comments = p.Comments.Select(c => new
                {
                    c.Id,
                    c.Content,
                    c.CreatedAt,
                    User = new { c.User.Id, c.User.UserName, c.User.Avatar }
                }).OrderBy(c => c.CreatedAt).ToList()
            })
            .ToListAsync();
        return Ok(posts);
    }

    [HttpPost("{postId:int}/like")]
    public async Task<IActionResult> ToggleLike(int postId)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var postExists = await _context.Posts.AnyAsync(p => p.Id == postId);
        if (!postExists) return NotFound();

        var existingLike = await _context.Likes
            .FirstOrDefaultAsync(l => l.PostId == postId && l.UserId == userId);

        var isLikedByMe = existingLike == null;
        if (existingLike == null)
        {
            _context.Likes.Add(new Like
            {
                PostId = postId,
                UserId = userId
            });
        }
        else
        {
            _context.Likes.Remove(existingLike);
        }

        await _context.SaveChangesAsync();

        var likesCount = await _context.Likes.CountAsync(l => l.PostId == postId);
        return Ok(new
        {
            postId,
            likesCount,
            isLikedByMe
        });
    }

    [HttpPost("{postId:int}/comments")]
    public async Task<IActionResult> CreateComment(int postId, [FromBody] CreateCommentDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var content = dto.Content?.Trim();
        if (string.IsNullOrEmpty(content)) return BadRequest("Comment content is required.");

        var postExists = await _context.Posts.AnyAsync(p => p.Id == postId);
        if (!postExists) return NotFound();

        var comment = new Comment
        {
            PostId = postId,
            UserId = userId,
            Content = content,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();
        await _context.Entry(comment).Reference(c => c.User).LoadAsync();

        return Ok(new
        {
            comment.Id,
            comment.Content,
            comment.CreatedAt,
            User = new { comment.User.Id, comment.User.UserName, comment.User.Email, comment.User.Avatar }
        });
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
