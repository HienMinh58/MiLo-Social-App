import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Grid,
  Heading,
  HStack,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { API_URL } from "../config/api";

interface UserInfo {
  id: string;
  userName: string;
  email: string;
}

const FriendsManager: React.FC = () => {
  const [friends, setFriends] = useState<UserInfo[]>([]);
  const [pendingRequests, setPendingRequests] = useState<UserInfo[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const toast = useToast();
  const token = localStorage.getItem("jwt");

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const [friendsRes, requestsRes, suggestedRes] = await Promise.all([
        axios.get(`${API_URL}/friends/list`, { headers }),
        axios.get(`${API_URL}/friends/request`, { headers }),
        axios.get(`${API_URL}/friends/non-friends`, { headers }),
      ]);

      setFriends(friendsRes.data);
      setPendingRequests(requestsRes.data);
      setSuggestedUsers(suggestedRes.data);
    } catch (error) {
      console.error("Failed to load friend data", error);
      toast({ title: "Failed to load friend data", status: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (method: string, endpoint: string, successMessage: string) => {
    try {
      await axios({
        method,
        url: `${API_URL}/friends/${endpoint}`,
        headers: { Authorization: `Bearer ${token}` },
      });
      toast({ title: successMessage, status: "success", duration: 2000 });
      await fetchData();
    } catch (error: any) {
      toast({
        title: "Action failed",
        description: error.response?.data || error.message,
        status: "error",
      });
    }
  };

  const renderUserRow = (
    user: UserInfo,
    action: React.ReactNode,
    accent: string,
  ) => (
    <HStack key={user.id} justify="space-between" p={3} bg="#fbfaf7" borderRadius="18px" spacing={3}>
      <HStack minW={0} spacing={3}>
        <Avatar name={user.userName} bg={accent} color="white" />
        <Box textAlign="left" minW={0}>
          <Text fontWeight="800" color="#172033" noOfLines={1}>
            {user.userName}
          </Text>
          <Text fontSize="sm" color="gray.500" noOfLines={1}>
            {user.email}
          </Text>
        </Box>
      </HStack>
      {action}
    </HStack>
  );

  if (loading) {
    return (
      <Container maxW="1040px" py={10}>
        <Text color="gray.600">Loading friends...</Text>
      </Container>
    );
  }

  return (
    <Box minH="100vh" py={{ base: 6, md: 10 }}>
      <Container maxW="1040px">
        <Box mb={7} textAlign="left">
          <Badge bg="#ff8a5c" color="white" borderRadius="full" px={3} py={1} mb={3}>
            Social circle
          </Badge>
          <Heading size={{ base: "lg", md: "xl" }} color="#172033" letterSpacing="0">
            Ban be cua ban
          </Heading>
          <Text color="gray.600" mt={2}>
            Quan ly loi moi, ket noi moi va danh sach ban than trong MiLo.
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={5}>
          <Box
            bg="rgba(255, 255, 255, 0.92)"
            p={6}
            boxShadow="0 18px 48px rgba(23, 32, 51, 0.09)"
            borderRadius="24px"
            border="1px solid"
            borderColor="whiteAlpha.800"
          >
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="#172033">Pending Requests</Heading>
              <Badge borderRadius="full" bg="#fff0e8" color="#d95d39">{pendingRequests.length}</Badge>
            </HStack>
            <VStack align="stretch" spacing={3}>
              {pendingRequests.length === 0 ? (
                <Text color="gray.500">No pending requests.</Text>
              ) : (
                pendingRequests.map((user) => renderUserRow(
                  user,
                  <HStack>
                    <Button size="sm" bg="#26cba3" color="white" borderRadius="full" onClick={() => handleAction("post", `accept/${user.id}`, "Request accepted")}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" borderRadius="full" onClick={() => handleAction("delete", `decline/${user.id}`, "Request declined")}>
                      Decline
                    </Button>
                  </HStack>,
                  "#26cba3",
                ))
              )}
            </VStack>
          </Box>

          <Box
            bg="rgba(255, 255, 255, 0.92)"
            p={6}
            boxShadow="0 18px 48px rgba(23, 32, 51, 0.09)"
            borderRadius="24px"
            border="1px solid"
            borderColor="whiteAlpha.800"
          >
            <HStack justify="space-between" mb={4}>
              <Heading size="md" color="#172033">My Friends</Heading>
              <Badge borderRadius="full" bg="#edf7f4" color="#16866d">{friends.length}</Badge>
            </HStack>
            <VStack align="stretch" spacing={3}>
              {friends.length === 0 ? (
                <Text color="gray.500">You haven't added any friends yet.</Text>
              ) : (
                friends.map((user) => renderUserRow(
                  user,
                  <Button size="sm" variant="outline" borderRadius="full" onClick={() => handleAction("delete", `remove/${user.id}`, "Friend removed")}>
                    Remove
                  </Button>,
                  "#ff8a5c",
                ))
              )}
            </VStack>
          </Box>
        </Grid>

        <Box
          mt={5}
          bg="rgba(255, 255, 255, 0.92)"
          p={6}
          boxShadow="0 18px 48px rgba(23, 32, 51, 0.09)"
          borderRadius="24px"
          border="1px solid"
          borderColor="whiteAlpha.800"
        >
          <HStack justify="space-between" mb={4}>
            <Heading size="md" color="#172033">Suggested People</Heading>
            <Badge borderRadius="full" bg="#eef1ff" color="#4a58bd">{suggestedUsers.length}</Badge>
          </HStack>
          <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={3}>
            {suggestedUsers.length === 0 ? (
              <Text color="gray.500">No suggestions right now.</Text>
            ) : (
              suggestedUsers.map((user) => renderUserRow(
                user,
                <Button size="sm" bg="#172033" color="white" borderRadius="full" onClick={() => handleAction("post", `request/${user.id}`, "Friend request sent")}>
                  Add
                </Button>,
                "#4a58bd",
              ))
            )}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default FriendsManager;
