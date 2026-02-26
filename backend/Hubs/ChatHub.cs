using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

[Authorize]
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
}