using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

[Route("api/video-call")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class VideoCallController : ControllerBase
{
    private readonly AppDbContext _context;

    public VideoCallController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("room")]
    public async Task<IActionResult> CreateRoom([FromBody] CreateVideoRoomDto dto)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();
        if (string.IsNullOrEmpty(dto.ReceiverId)) return BadRequest("Receiver is required.");

        var areFriends = await _context.Friends.AnyAsync(f =>
            f.RequesterId == currentUserId &&
            f.AddresseeId == dto.ReceiverId &&
            f.FriendStatus == FriendStatus.Accepted);

        if (!areFriends) return Forbid();

        var roomName = $"milo-{Guid.NewGuid():N}";
        var roomUrl = $"https://meet.jit.si/{roomName}";

        return Ok(new { roomUrl, roomName });
    }
}

public class CreateVideoRoomDto
{
    public string ReceiverId { get; set; } = string.Empty;
}
