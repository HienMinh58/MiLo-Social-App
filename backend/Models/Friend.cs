public class Friend
{
    public string RequesterId { get; set; } = string.Empty;
    public string AddresseeId { get; set; } = string.Empty;
    public FriendStatus FriendStatus { get; set; } = FriendStatus.Pending;
    public User? Requester { get; set; }
    public User? Addressee { get; set; } 
}

public enum FriendStatus
{
    Pending,
    Accepted
}