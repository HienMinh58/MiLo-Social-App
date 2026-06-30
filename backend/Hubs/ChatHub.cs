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

    public async Task InviteVideoCall(string receiverId, string callerName)
    {
        var senderId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId)) return;

        var senderUser = await _userManager.FindByIdAsync(senderId);
        await Clients.User(receiverId).SendAsync(
            "ReceiveVideoCallInvite",
            senderId,
            senderUser?.UserName ?? callerName ?? "MiLo user");
    }

    public async Task AcceptVideoCall(string callerId)
    {
        var receiverId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(callerId)) return;

        await Clients.User(callerId).SendAsync("VideoCallAccepted", receiverId);
    }

    public async Task DeclineVideoCall(string callerId)
    {
        var receiverId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(callerId)) return;

        await Clients.User(callerId).SendAsync("VideoCallDeclined", receiverId);
    }

    public async Task SendVideoOffer(string receiverId, string offer)
    {
        var senderId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(offer)) return;

        await Clients.User(receiverId).SendAsync("ReceiveVideoOffer", senderId, offer);
    }

    public async Task SendVideoAnswer(string receiverId, string answer)
    {
        var senderId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(answer)) return;

        await Clients.User(receiverId).SendAsync("ReceiveVideoAnswer", senderId, answer);
    }

    public async Task SendIceCandidate(string receiverId, string candidate)
    {
        var senderId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId) || string.IsNullOrEmpty(candidate)) return;

        await Clients.User(receiverId).SendAsync("ReceiveIceCandidate", senderId, candidate);
    }

    public async Task EndVideoCall(string receiverId)
    {
        var senderId = Context.UserIdentifier;
        if (string.IsNullOrEmpty(senderId) || string.IsNullOrEmpty(receiverId)) return;

        await Clients.User(receiverId).SendAsync("VideoCallEnded", senderId);
    }
}
