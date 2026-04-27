using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;

[Route("api/{controller}")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var user = await _context.Users
            .Where(u => u.Id == currentUserId)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.Bio,
                u.Avatar
            })
            .FirstOrDefaultAsync();
        
        if (user == null) 
            return NotFound("User Not Found.");
        
        return Ok(user);
    }

    [HttpGet("{userId}")]
     public async Task<IActionResult> GetUserProfile(string userId)
    {
        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email,
                u.Bio,
                u.Avatar
            })
            .FirstOrDefaultAsync();
        
        if (user == null) return NotFound("User Not Found.");

        return Ok(user);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string q)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(q)) return Ok(new List<object>());

        var users = await _context.Users
            .Where(u => u.Id != currentUserId && u.UserName != null && u.UserName.ToLower().Contains(q.ToLower()))
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Avatar
            })
            .Take(10)
            .ToListAsync();

        return Ok(users);
    }

    [HttpPut("edit")]
    public async Task<IActionResult> EditProfile([FromBody] ProfileEditDto dto)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == null) return Unauthorized();

        var user = await _context.Users.FindAsync(currentUserId);
        if (user == null) return NotFound("User Not Found.");

        user.Bio = dto.Bio ?? user.Bio;
        user.Avatar = dto.AvatarUrl ?? user.Avatar;

        await _context.SaveChangesAsync();

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.Bio,
            user.Avatar
        });
    }
}

public class ProfileEditDto
{
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}