import { useEffect, useState } from "react";
import { initSignalR, getConnection, disconnectSignalR } from "../services/signalr";
import { API_URL } from "../config/api";
import axios from "axios";

interface Message {
  senderId: string;
  content: string;
  sentAt: string;
  senderAvatarUrl: string;
}

interface Friend {
  id: string;
  userName: string;
  email: string;
}

interface SelectedUser {
  id: string;
  userName: string;
  avatar?: string;
}

function getUserIdFromToken(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || payload.nameidentifier || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}

export default function Messenger() {
  const [messages, setMessages] = useState<Message[]>([]); 
  const [chatSelectedUserId, setChatSelectedUserId] = useState<string | null>(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState<SelectedUser | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const accessToken = localStorage.getItem("jwt");
  const currentUserId = accessToken ? getUserIdFromToken(accessToken) : null;
  // Fetch friends list
  useEffect(() => {
    const fetchFriends = async () => {
      
      try {
        const res = await axios.get(`${API_URL}/friends/list`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setFriends(res.data);
      } catch (err) {
        console.error("Error fetching friends:", err);
      }
    };

    fetchFriends();
  }, [accessToken]);

  // Initialize SignalR
  useEffect(() => {
    if (!accessToken) return;
    initSignalR(accessToken, (senderId, content, sentAt, senderAvatarUrl) => {
      if (
        chatSelectedUserId &&
        (senderId === chatSelectedUserId || senderId === currentUserId)
      ) {
        setMessages((prev) => [
          ...prev,
          { senderId, content, sentAt, senderAvatarUrl },
        ]);
      }
    });
  }, [accessToken, currentUserId, chatSelectedUserId]);

  // Load chat history when user is selected
  useEffect(() => {
    const loadChatHistory = async () => {
      if (!chatSelectedUserId) return;

      setLoading(true);
      try {
        const res = await axios.get(
          `${API_URL}/chat/history/${chatSelectedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setMessages(res.data);
      } catch (err) {
        console.error("Error loading chat history:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadChatHistory();
  }, [chatSelectedUserId, accessToken]);

  // Fetch selected user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!chatSelectedUserId) {
        setSelectedUserInfo(null);
        return;
      }

      try {
        const res = await axios.get(
          `${API_URL}/profile/${chatSelectedUserId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setSelectedUserInfo({
          id: res.data.id,
          userName: res.data.userName,
          avatar: res.data.avatar,
        });
      } catch (err) {
        console.error("Error fetching user details:", err);
      }
    };

    fetchUserDetails();
  }, [chatSelectedUserId, accessToken]);

  const sendMessage = async () => {
    if (!input.trim() || !chatSelectedUserId) return;
    try {
      const conn = getConnection();

      await conn?.invoke(
        "SendMessage",
        chatSelectedUserId,
        input
      );

      setInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectUser = (userId: string) => {
    setChatSelectedUserId(userId);
    setMessages([]);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnectSignalR();
    };
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f5f5f5" }}>
      
      {/* Sidebar */}
      <div style={{
        width: "300px",
        borderRight: "1px solid #e0e0e0",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        padding: "16px",
        overflowY: "auto"
      }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: "24px", fontWeight: "bold" }}>Chats</h2>
        
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px"
        }}>
          {friends.length === 0 ? (
            <p style={{ color: "#999", textAlign: "center", marginTop: "20px" }}>
              No friends yet
            </p>
          ) : (
            friends.map((friend) => (
              <div
                key={friend.id}
                onClick={() => handleSelectUser(friend.id)}
                style={{
                  padding: "12px 16px",
                  cursor: "pointer",
                  borderRadius: "8px",
                  backgroundColor: chatSelectedUserId === friend.id ? "#e3f2fd" : "transparent",
                  borderLeft: chatSelectedUserId === friend.id ? "4px solid #2196f3" : "none",
                  transition: "background-color 0.2s",
                  userSelect: "none"
                }}
                onMouseEnter={(e) => {
                  if (chatSelectedUserId !== friend.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#f9f9f9";
                  }
                }}
                onMouseLeave={(e) => {
                  if (chatSelectedUserId !== friend.id) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  }
                }}
              >
                <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                  {friend.userName}
                </div>
                <div style={{ fontSize: "12px", color: "#999" }}>
                  {friend.email}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "white"
      }}>

        {!chatSelectedUserId ? (
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#999"
          }}>
            <h3>Select a conversation to start messaging</h3>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div style={{
              padding: "16px 24px",
              borderBottom: "1px solid #e0e0e0",
              backgroundColor: "#fafafa"
            }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
                {selectedUserInfo?.userName}
              </h3>
            </div>

            {/* Messages Box */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              {loading ? (
                <div style={{ textAlign: "center", color: "#999", marginTop: "20px" }}>
                  Loading messages...
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: "center", color: "#999", marginTop: "20px" }}>
                  No messages yet. Start the conversation!
                </div>
              ) : (
                messages.map((message, i) => {
                  const isMine = message.senderId === currentUserId;
                  const senderName = isMine ? "You" : (selectedUserInfo?.userName || "Unknown");
                  const showAvatar = !isMine;

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: isMine ? "flex-end" : "flex-start",
                        marginBottom: "16px"
                      }}
                    >
                      {/* Sender Name */}
                      <span style={{ 
                        fontSize: "12px", 
                        color: "#777", 
                        marginBottom: "4px", 
                        marginLeft: showAvatar ? "46px" : "0",
                        marginRight: isMine ? "4px" : "0"
                      }}>
                        {senderName}
                      </span>
                      
                      <div style={{ 
                        display: "flex", 
                        flexDirection: isMine ? "row-reverse" : "row", 
                        alignItems: "flex-end", 
                        gap: "10px", 
                        maxWidth: "75%" 
                      }}>
                        
                        {/* Avatar only for other people */}
                        {showAvatar && (
                          <div style={{
                            width: "36px", 
                            height: "36px", 
                            borderRadius: "50%", 
                            backgroundColor: "#e0e0e0",
                            flexShrink: 0,
                            overflow: "hidden"
                          }}>
                            {message.senderAvatarUrl || selectedUserInfo?.avatar ? (
                                <img 
                                src={message.senderAvatarUrl || selectedUserInfo?.avatar} 
                                alt={senderName}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                              />
                            ) : null}
                          </div>
                        )}

                        {/* Message Bubble */}
                        <div style={{
                          backgroundColor: isMine ? "#2196f3" : "#f1f1f1",
                          color: isMine ? "white" : "black",
                          padding: "12px 16px",
                          borderRadius: isMine ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                          wordWrap: "break-word",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
                        }}>
                          <div style={{ fontSize: "15px", lineHeight: "1.4" }}>
                            {message.content}
                          </div>
                          <div style={{
                            fontSize: "11px",
                            marginTop: "6px",
                            opacity: isMine ? 0.8 : 0.5,
                            textAlign: isMine ? "right" : "left"
                          }}>
                            {new Date(message.sentAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit"
                            })}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Area */}
            <div style={{
              padding: "16px 24px",
              borderTop: "1px solid #e0e0e0",
              backgroundColor: "#fafafa",
              display: "flex",
              gap: "8px"
            }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type a message..."
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  border: "1px solid #ddd",
                  borderRadius: "24px",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />

              <button
                onClick={sendMessage}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#2196f3",
                  color: "white",
                  border: "none",
                  borderRadius: "24px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#1976d2";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#2196f3";
                }}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}