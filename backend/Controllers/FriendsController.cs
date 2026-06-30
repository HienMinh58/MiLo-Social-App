using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

[Route("api/[controller]")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class FriendsController : ControllerBase
{
    private readonly AppDbContext _context;

    public FriendsController(AppDbContext context)
    {
        _context = context;
    }
    [HttpPost("request/{userId}")]
    public async Task<IActionResult> SendRequest(string userId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == userId) return BadRequest("Cannot friend yourself.");

        var existing = await _context.Friends
            .FirstOrDefaultAsync(f =>
                (f.RequesterId == currentUserId && f.AddresseeId == userId) ||
                (f.RequesterId == userId && f.AddresseeId == currentUserId));
        if (existing != null) return BadRequest("Request already sent or friends");

        var friendRequest = new Friend
        {
            RequesterId = currentUserId,
            AddresseeId = userId,
            FriendStatus = FriendStatus.Pending
        };

        _context.Friends.Add(friendRequest);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost("accept/{requesterId}")]
    public async Task<IActionResult> AcceptRequest(string requesterId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var request = await _context.Friends.FindAsync(requesterId, currentUserId);

        if (request == null || request.FriendStatus != FriendStatus.Pending)
            return NotFound("Friend request not found.");
        
        request.FriendStatus = FriendStatus.Accepted;

        var reverse = new Friend
        {
            RequesterId = currentUserId,
            AddresseeId = requesterId,
            FriendStatus = FriendStatus.Accepted
        };
        _context.Friends.Add(reverse);

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpGet("request")]
    public async Task<IActionResult> GetPendingRequests()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var requests = await _context.Friends
            .Where(f => f.AddresseeId == currentUserId && f.FriendStatus == FriendStatus.Pending)
            .Include(f => f.Requester)
            .Select(f => new
            {
                f.Requester.Id,
                f.Requester.UserName,
                f.Requester.Email
            })
            .ToListAsync();
        
        return Ok(requests);
    }

    [HttpGet("list")]
    public async Task<IActionResult> GetFriends()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var friends = await _context.Friends
            .Where(f => f.RequesterId == currentUserId && f.FriendStatus == FriendStatus.Accepted)
            .Include(f => f.Addressee)
            .Select(f => new
            {
                f.Addressee.Id,
                f.Addressee.UserName,
                f.Addressee.Email
            })
            .ToListAsync();
        
        return Ok(friends);
    }

    [HttpGet("non-friends")]
    public async Task<IActionResult> GetNonFriends()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        //Get friend IDs
        var friendIds = await _context.Friends
            .Where(f => f.RequesterId == currentUserId || f.AddresseeId == currentUserId)
            .Select(f => f.RequesterId == currentUserId ? f.AddresseeId : f.RequesterId)
            .ToListAsync();
        
        friendIds.Add(currentUserId);

        var users = await _context.Users
            .Where(u => !friendIds.Contains(u.Id))
            .OrderBy(u => Guid.NewGuid())
            .Select(u => new
            {
                u.Id,
                u.UserName,
                u.Email
            })
            .Take(10)
            .ToListAsync();
        
        return Ok(users);
    }

    [HttpDelete("decline/{requesterId}")]
    public async Task<IActionResult> DeclineRequest(string requesterId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var request = await _context.Friends.FindAsync(requesterId, currentUserId);

        if (request == null || request.FriendStatus != FriendStatus.Pending)
            return NotFound("Pending friend request not found.");
        
        _context.Friends.Remove(request);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpDelete("remove/{friendId}")]
    public async Task<IActionResult> RemoveFriend(string friendId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        // A friendship involves two records (A -> B and B -> A)
        var relationship1 = await _context.Friends.FindAsync(currentUserId, friendId);
        var relationship2 = await _context.Friends.FindAsync(friendId, currentUserId);

        if (relationship1 != null) _context.Friends.Remove(relationship1);
        if (relationship2 != null) _context.Friends.Remove(relationship2);

        if (relationship1 == null && relationship2 == null)
            return NotFound("Friend relationship not found.");

        await _context.SaveChangesAsync();
        return Ok();
    }
}
