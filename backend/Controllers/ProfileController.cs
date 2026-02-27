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
}