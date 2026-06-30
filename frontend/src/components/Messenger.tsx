import { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Input,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
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

interface IncomingCall {
  callerId: string;
  callerName: string;
}

function getUserIdFromToken(token: string) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    const payload = JSON.parse(jsonPayload);
    return payload.sub || payload.nameidentifier || payload.userId || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
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
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [activeCallUserId, setActiveCallUserId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [startingCall, setStartingCall] = useState(false);
  const toast = useToast();
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const pendingIceCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  const accessToken = localStorage.getItem("jwt");
  const currentUserId = accessToken ? getUserIdFromToken(accessToken) : null;

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

  useEffect(() => {
    if (!accessToken) return;

    const setupRealtime = async () => {
      await initSignalR(accessToken, (senderId, content, sentAt, senderAvatarUrl) => {
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

      const conn = getConnection();
      if (!conn) return;

      conn.off("ReceiveVideoCallInvite");
      conn.on("ReceiveVideoCallInvite", (callerId: string, callerName: string) => {
        setIncomingCall({ callerId, callerName });
      });

      conn.off("VideoCallAccepted");
      conn.on("VideoCallAccepted", async (receiverId: string) => {
        await createAndSendOffer(receiverId);
      });

      conn.off("VideoCallDeclined");
      conn.on("VideoCallDeclined", () => {
        toast({ title: "Video call declined", status: "info", duration: 2500 });
        endLocalCall();
      });

      conn.off("ReceiveVideoOffer");
      conn.on("ReceiveVideoOffer", async (callerId: string, offer: string) => {
        await handleVideoOffer(callerId, offer);
      });

      conn.off("ReceiveVideoAnswer");
      conn.on("ReceiveVideoAnswer", async (_receiverId: string, answer: string) => {
        const pc = peerConnectionRef.current;
        if (!pc) return;
        await pc.setRemoteDescription(JSON.parse(answer));
        await flushPendingIceCandidates(pc);
      });

      conn.off("ReceiveIceCandidate");
      conn.on("ReceiveIceCandidate", async (_senderId: string, candidate: string) => {
        const pc = peerConnectionRef.current;
        const parsedCandidate = JSON.parse(candidate);

        if (!pc || !pc.remoteDescription) {
          pendingIceCandidatesRef.current.push(parsedCandidate);
          return;
        }

        await pc.addIceCandidate(parsedCandidate);
      });

      conn.off("VideoCallEnded");
      conn.on("VideoCallEnded", () => {
        endLocalCall();
        toast({ title: "Video call ended", status: "info", duration: 2500 });
      });
    };

    setupRealtime();
  }, [accessToken, currentUserId, chatSelectedUserId]);

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
          },
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
          },
        );
        setSelectedUserInfo({
          id: res.data.id,
          userName: res.data.userName,
          avatar: res.data.avatar || res.data.Avatar,
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
      await conn?.invoke("SendMessage", chatSelectedUserId, input);
      setInput("");
    } catch (err) {
      console.error(err);
    }
  };

  const attachVideoStream = (video: HTMLVideoElement | null, stream: MediaStream | null) => {
    if (!video) return;
    video.srcObject = stream;
    if (stream) {
      video.play().catch(() => undefined);
    }
  };

  useEffect(() => {
    attachVideoStream(localVideoRef.current, localStream);
  }, [localStream, activeCallUserId]);

  useEffect(() => {
    attachVideoStream(remoteVideoRef.current, remoteStream);
  }, [remoteStream, activeCallUserId]);

  const addLocalTracks = (pc: RTCPeerConnection, stream: MediaStream) => {
    const existingTrackIds = new Set(
      pc.getSenders()
        .map((sender) => sender.track?.id)
        .filter(Boolean),
    );

    stream.getTracks().forEach((track) => {
      if (!existingTrackIds.has(track.id)) {
        pc.addTrack(track, stream);
      }
    });
  };

  const flushPendingIceCandidates = async (pc: RTCPeerConnection) => {
    const candidates = pendingIceCandidatesRef.current;
    pendingIceCandidatesRef.current = [];

    for (const candidate of candidates) {
      await pc.addIceCandidate(candidate);
    }
  };

  const createPeerConnection = (remoteUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    const remote = new MediaStream();
    const conn = getConnection();

    pc.ontrack = (event) => {
      event.streams[0]?.getTracks().forEach((track) => {
        if (!remote.getTracks().some((existingTrack) => existingTrack.id === track.id)) {
          remote.addTrack(track);
        }
      });

      remoteStreamRef.current = remote;
      setRemoteStream(new MediaStream(remote.getTracks()));
    };

    pc.onicecandidate = async (event) => {
      if (!event.candidate) return;
      await conn?.invoke("SendIceCandidate", remoteUserId, JSON.stringify(event.candidate));
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        toast({
          title: "Video connection failed",
          description: "The peer-to-peer connection could not be established.",
          status: "error",
          duration: 4000,
        });
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const getCallMedia = async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };

  const closePeerConnection = () => {
    peerConnectionRef.current?.close();
    peerConnectionRef.current = null;
  };

  const stopStream = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => track.stop());
  };

  const endLocalCall = () => {
    closePeerConnection();
    stopStream(localStreamRef.current);
    stopStream(remoteStreamRef.current);
    localStreamRef.current = null;
    remoteStreamRef.current = null;
    pendingIceCandidatesRef.current = [];
    setLocalStream(null);
    setRemoteStream(null);
    setActiveCallUserId(null);
    setStartingCall(false);
  };

  const createAndSendOffer = async (receiverId: string) => {
    try {
      const stream = localStreamRef.current ?? await getCallMedia();
      const pc = peerConnectionRef.current ?? createPeerConnection(receiverId);
      addLocalTracks(pc, stream);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await getConnection()?.invoke("SendVideoOffer", receiverId, JSON.stringify(offer));
      setActiveCallUserId(receiverId);
    } catch (err: any) {
      endLocalCall();
      toast({ title: "Could not start video call", description: err.message, status: "error" });
    }
  };

  const handleVideoOffer = async (callerId: string, offer: string) => {
    try {
      const stream = localStreamRef.current ?? await getCallMedia();
      const pc = peerConnectionRef.current ?? createPeerConnection(callerId);
      addLocalTracks(pc, stream);

      await pc.setRemoteDescription(JSON.parse(offer));
      await flushPendingIceCandidates(pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await getConnection()?.invoke("SendVideoAnswer", callerId, JSON.stringify(answer));
      setActiveCallUserId(callerId);
    } catch (err: any) {
      endLocalCall();
      toast({ title: "Could not answer video call", description: err.message, status: "error" });
    }
  };

  const startVideoCall = async () => {
    if (!chatSelectedUserId) return;

    try {
      setStartingCall(true);
      await getCallMedia();
      setActiveCallUserId(chatSelectedUserId);
      const conn = getConnection();
      await conn?.invoke("InviteVideoCall", chatSelectedUserId, selectedUserInfo?.userName || "MiLo user");
      toast({ title: "Calling...", status: "info", duration: 2000 });
    } catch (err: any) {
      endLocalCall();
      toast({
        title: "Could not start video call",
        description: err.message,
        status: "error",
      });
    } finally {
      setStartingCall(false);
    }
  };

  const acceptVideoCall = async () => {
    if (!incomingCall) return;

    try {
      const conn = getConnection();
      await getCallMedia();
      setActiveCallUserId(incomingCall.callerId);
      await conn?.invoke("AcceptVideoCall", incomingCall.callerId);
    } finally {
      setIncomingCall(null);
    }
  };

  const declineVideoCall = async () => {
    if (!incomingCall) return;

    try {
      const conn = getConnection();
      await conn?.invoke("DeclineVideoCall", incomingCall.callerId);
    } finally {
      setIncomingCall(null);
    }
  };

  const endVideoCall = async () => {
    const receiverId = activeCallUserId;
    endLocalCall();
    if (receiverId) {
      await getConnection()?.invoke("EndVideoCall", receiverId);
    }
  };

  const handleSelectUser = (userId: string) => {
    setChatSelectedUserId(userId);
    setMessages([]);
  };

  useEffect(() => {
    return () => {
      disconnectSignalR();
    };
  }, []);

  return (
    <Box minH="calc(100vh - 72px)" px={{ base: 3, md: 8 }} py={{ base: 4, md: 8 }}>
      {incomingCall && (
        <Box
          position="fixed"
          right={{ base: 4, md: 8 }}
          top={{ base: 4, md: 8 }}
          zIndex={200}
          bg="white"
          border="1px solid"
          borderColor="blackAlpha.100"
          borderRadius="20px"
          boxShadow="0 22px 70px rgba(23, 32, 51, 0.18)"
          p={5}
          maxW="340px"
          textAlign="left"
        >
          <Text fontWeight="900" color="#172033" mb={1}>
            Incoming video call
          </Text>
          <Text color="gray.600" mb={4}>
            {incomingCall.callerName} is calling you.
          </Text>
          <HStack justify="flex-end">
            <Button size="sm" variant="outline" borderRadius="full" onClick={declineVideoCall}>
              Decline
            </Button>
            <Button size="sm" bg="#26cba3" color="white" borderRadius="full" onClick={acceptVideoCall}>
              Accept
            </Button>
          </HStack>
        </Box>
      )}
      {activeCallUserId && (
        <Box
          position="fixed"
          left={{ base: 4, md: 8 }}
          right={{ base: 4, md: 8 }}
          bottom={{ base: 4, md: 8 }}
          zIndex={190}
          bg="#172033"
          borderRadius="20px"
          boxShadow="0 22px 70px rgba(23, 32, 51, 0.28)"
          p={4}
        >
          <Flex gap={3} align="stretch" direction={{ base: "column", md: "row" }}>
            <Box flex={1} bg="black" borderRadius="14px" overflow="hidden" minH={{ base: "180px", md: "260px" }}>
              <video ref={remoteVideoRef} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            <Box w={{ base: "100%", md: "260px" }} bg="black" borderRadius="14px" overflow="hidden" minH="160px">
              <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
            <Button alignSelf={{ base: "stretch", md: "center" }} bg="#ff6b6b" color="white" borderRadius="full" onClick={endVideoCall}>
              End Call
            </Button>
          </Flex>
        </Box>
      )}
      <Flex
        maxW="1180px"
        mx="auto"
        h={{ base: "calc(100vh - 150px)", md: "calc(100vh - 130px)" }}
        minH="560px"
        bg="rgba(255, 255, 255, 0.92)"
        borderRadius="28px"
        overflow="hidden"
        border="1px solid"
        borderColor="whiteAlpha.800"
        boxShadow="0 26px 80px rgba(23, 32, 51, 0.14)"
      >
        <Box
          w={{ base: "118px", md: "330px" }}
          borderRight="1px solid"
          borderColor="blackAlpha.100"
          bg="#fffdf9"
          p={{ base: 3, md: 5 }}
          overflowY="auto"
        >
          <HStack justify="space-between" mb={5}>
            <Heading size={{ base: "sm", md: "md" }} color="#172033">
              Chats
            </Heading>
            <Badge bg="#26cba3" color="white" borderRadius="full">
              {friends.length}
            </Badge>
          </HStack>

          <VStack align="stretch" spacing={2}>
            {friends.length === 0 ? (
              <Text color="gray.500" fontSize="sm" textAlign="center" mt={8}>
                No friends yet
              </Text>
            ) : (
              friends.map((friend) => {
                const selected = chatSelectedUserId === friend.id;

                return (
                  <HStack
                    key={friend.id}
                    onClick={() => handleSelectUser(friend.id)}
                    p={{ base: 2, md: 3 }}
                    spacing={3}
                    cursor="pointer"
                    borderRadius="18px"
                    bg={selected ? "#172033" : "transparent"}
                    color={selected ? "white" : "#172033"}
                    transition="0.2s ease"
                    _hover={{ bg: selected ? "#172033" : "#f3fbf8" }}
                  >
                    <Avatar name={friend.userName} size={{ base: "sm", md: "md" }} bg="#ff8a5c" color="white" />
                    <Box display={{ base: "none", md: "block" }} minW={0} textAlign="left">
                      <Text fontWeight="800" noOfLines={1}>
                        {friend.userName}
                      </Text>
                      <Text fontSize="sm" color={selected ? "whiteAlpha.700" : "gray.500"} noOfLines={1}>
                        {friend.email}
                      </Text>
                    </Box>
                  </HStack>
                );
              })
            )}
          </VStack>
        </Box>

        <Flex flex={1} direction="column" minW={0}>
          {!chatSelectedUserId ? (
            <Flex flex={1} align="center" justify="center" direction="column" px={6} textAlign="center">
              <Badge bg="#fff0e8" color="#d95d39" borderRadius="full" px={3} py={1} mb={4}>
                MiLo Messenger
              </Badge>
              <Heading size={{ base: "md", md: "lg" }} color="#172033">
                Chon mot nguoi de bat dau chat
              </Heading>
              <Text color="gray.500" mt={2}>
                Tin nhan se hien thi o day khi ban mo mot cuoc tro chuyen.
              </Text>
            </Flex>
          ) : (
            <>
              <HStack
                px={{ base: 4, md: 6 }}
                py={4}
                borderBottom="1px solid"
                borderColor="blackAlpha.100"
                bg="whiteAlpha.800"
                justify="space-between"
              >
                <HStack minW={0}>
                  <Avatar src={selectedUserInfo?.avatar} name={selectedUserInfo?.userName} bg="#26cba3" color="white" />
                  <Box textAlign="left" minW={0}>
                    <Heading size="sm" color="#172033" noOfLines={1}>
                      {selectedUserInfo?.userName}
                    </Heading>
                    <Text fontSize="sm" color="gray.500">
                      Active on MiLo
                    </Text>
                  </Box>
                </HStack>
                <Button
                  size="sm"
                  bg="#172033"
                  color="white"
                  borderRadius="full"
                  onClick={startVideoCall}
                  isLoading={startingCall}
                  loadingText="Calling"
                  _hover={{ bg: "#25324d" }}
                >
                  Video Call
                </Button>
              </HStack>

              <VStack flex={1} overflowY="auto" align="stretch" spacing={4} p={{ base: 4, md: 6 }} bg="#fbfaf7">
                {loading ? (
                  <Text textAlign="center" color="gray.500" mt={6}>
                    Loading messages...
                  </Text>
                ) : messages.length === 0 ? (
                  <Text textAlign="center" color="gray.500" mt={6}>
                    No messages yet. Start the conversation!
                  </Text>
                ) : (
                  messages.map((message, i) => {
                    const isMine = message.senderId === currentUserId;
                    const senderName = isMine ? "You" : (selectedUserInfo?.userName || "Unknown");

                    return (
                      <Flex key={i} justify={isMine ? "flex-end" : "flex-start"}>
                        <HStack align="flex-end" spacing={2} maxW={{ base: "92%", md: "76%" }} flexDirection={isMine ? "row-reverse" : "row"}>
                          {!isMine && (
                            <Avatar
                              size="sm"
                              src={message.senderAvatarUrl || selectedUserInfo?.avatar}
                              name={senderName}
                              bg="#26cba3"
                              color="white"
                            />
                          )}
                          <Box
                            bg={isMine ? "#172033" : "white"}
                            color={isMine ? "white" : "#172033"}
                            px={4}
                            py={3}
                            borderRadius={isMine ? "20px 20px 6px 20px" : "20px 20px 20px 6px"}
                            boxShadow="0 12px 28px rgba(23, 32, 51, 0.08)"
                            textAlign="left"
                          >
                            <Text fontSize="sm" lineHeight="1.55">
                              {message.content}
                            </Text>
                            <Text fontSize="xs" mt={2} opacity={0.65} textAlign={isMine ? "right" : "left"}>
                              {new Date(message.sentAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          </Box>
                        </HStack>
                      </Flex>
                    );
                  })
                )}
              </VStack>

              <HStack p={{ base: 4, md: 5 }} borderTop="1px solid" borderColor="blackAlpha.100" bg="white">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  bg="#fbfaf7"
                  borderRadius="full"
                  borderColor="blackAlpha.100"
                  _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
                />
                <Button
                  onClick={sendMessage}
                  bg="#26cba3"
                  color="white"
                  borderRadius="full"
                  px={{ base: 5, md: 8 }}
                  _hover={{ bg: "#20ae8c" }}
                >
                  Send
                </Button>
              </HStack>
            </>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
