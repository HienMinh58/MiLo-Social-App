using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class ChatHub : Hub
{
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;
    public ChatHub(AppDbContext context, UserManager<User> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task SendMessage(string receiverId, string content)
    {
        var senderId = Context.UserIdentifier;
        if(string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(content)) return;

        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = receiverId,
            Content = content,
            SentAt = DateTime.UtcNow
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        var senderUser = await _userManager.FindByIdAsync(senderId);
        var senderAvatarUrl = senderUser?.Avatar ?? "";

        await Clients.User(receiverId).SendAsync("ReceiveMessage", senderId, content, message.SentAt, senderAvatarUrl);

        await Clients.Caller.SendAsync("ReceiveMessage", senderId, content, message.SentAt, senderAvatarUrl);
    }

    public async Task InviteVideoCall(string receiverId, string roomUrl)
    {
        var senderId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(roomUrl)) return;

        var senderUser = await _userManager.FindByIdAsync(senderId);
        await Clients.User(receiverId).SendAsync(
            "ReceiveVideoCallInvite",
            senderId,
            senderUser?.UserName ?? "MiLo user",
            roomUrl);
    }

    public async Task AcceptVideoCall(string callerId, string roomUrl)
    {
        var receiverId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(callerId) || string.IsNullOrEmpty(roomUrl)) return;

        await Clients.User(callerId).SendAsync("VideoCallAccepted", receiverId, roomUrl);
    }

    public async Task DeclineVideoCall(string callerId)
    {
        var receiverId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(callerId)) return;

        await Clients.User(callerId).SendAsync("VideoCallDeclined", receiverId);
    }
}
