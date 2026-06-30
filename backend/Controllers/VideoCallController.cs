using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

[Route("api/video-call")]
[ApiController]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class VideoCallController : ControllerBase
{
    private readonly IConfiguration _config;
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _context;

    public VideoCallController(IConfiguration config, IHttpClientFactory httpClientFactory, AppDbContext context)
    {
        _config = config;
        _httpClient = httpClientFactory.CreateClient();
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

        var apiKey = _config["Daily:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return StatusCode(500, "Daily API key is not configured.");
        }

        var roomName = $"milo-{Guid.NewGuid():N}";
        var exp = DateTimeOffset.UtcNow.AddHours(1).ToUnixTimeSeconds();

        using var request = new HttpRequestMessage(HttpMethod.Post, "https://api.daily.co/v1/rooms");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Content = JsonContent.Create(new
        {
            name = roomName,
            privacy = "public",
            properties = new
            {
                exp,
                enable_prejoin_ui = true,
                enable_screenshare = true,
                enable_chat = false,
                eject_at_room_exp = true
            }
        });

        using var response = await _httpClient.SendAsync(request);
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            return StatusCode((int)response.StatusCode, error);
        }

        var room = await response.Content.ReadFromJsonAsync<DailyRoomResponse>();
        if (room == null || string.IsNullOrEmpty(room.Url))
        {
            return StatusCode(500, "Daily did not return a room URL.");
        }

        return Ok(new { roomUrl = room.Url, roomName = room.Name });
    }
}

public class CreateVideoRoomDto
{
    public string ReceiverId { get; set; } = string.Empty;
}

public class DailyRoomResponse
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; set; } = string.Empty;
}
