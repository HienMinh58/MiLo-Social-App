import React, { useEffect, useState } from "react";
import { Box, Button, Container, Heading, HStack, Text, VStack, Divider, useToast } from "@chakra-ui/react";
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
                axios.get(`${API_URL}/friends/non-friends`, { headers })
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
                headers: { Authorization: `Bearer ${token}` }
            });
            toast({ title: successMessage, status: "success", duration: 2000 });
            await fetchData();
        } catch (error: any) {
            toast({ 
                title: "Action failed", 
                description: error.response?.data || error.message, 
                status: "error" 
            });
        }
    };

    if (loading) return <Container py={10}><Text>Loading friends...</Text></Container>;

    return (
        <Container maxW="container.md" py={8}>
            <Heading mb={6}>Friends</Heading>

            {/* Pending Requests */}
            <Box bg="white" p={6} shadow="sm" borderRadius="lg" mb={6}>
                <Heading size="md" mb={4}>Pending Requests ({pendingRequests.length})</Heading>
                <VStack align="stretch" spacing={4}>
                    {pendingRequests.length === 0 ? (
                        <Text color="gray.500">No pending requests.</Text>
                    ) : (
                        pendingRequests.map(user => (
                            <HStack key={user.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                                <Box>
                                    <Text fontWeight="bold">{user.userName}</Text>
                                    <Text fontSize="sm" color="gray.500">{user.email}</Text>
                                </Box>
                                <HStack>
                                    <Button size="sm" colorScheme="green" onClick={() => handleAction("post", `accept/${user.id}`, "Request accepted")}>
                                        Accept
                                    </Button>
                                    <Button size="sm" colorScheme="red" onClick={() => handleAction("delete", `decline/${user.id}`, "Request declined")}>
                                        Decline
                                    </Button>
                                </HStack>
                            </HStack>
                        ))
                    )}
                </VStack>
            </Box>

            {/* My Friends */}
            <Box bg="white" p={6} shadow="sm" borderRadius="lg" mb={6}>
                <Heading size="md" mb={4}>My Friends ({friends.length})</Heading>
                <VStack align="stretch" spacing={4}>
                    {friends.length === 0 ? (
                        <Text color="gray.500">You haven't added any friends yet.</Text>
                    ) : (
                        friends.map(user => (
                            <HStack key={user.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                                <Box>
                                    <Text fontWeight="bold">{user.userName}</Text>
                                    <Text fontSize="sm" color="gray.500">{user.email}</Text>
                                </Box>
                                <Button size="sm" colorScheme="red" variant="outline" onClick={() => handleAction("delete", `remove/${user.id}`, "Friend removed")}>
                                    Remove
                                </Button>
                            </HStack>
                        ))
                    )}
                </VStack>
            </Box>

            {/* Suggested Users */}
            <Box bg="white" p={6} shadow="sm" borderRadius="lg">
                <Heading size="md" mb={4}>Suggested People</Heading>
                <VStack align="stretch" spacing={4}>
                    {suggestedUsers.length === 0 ? (
                        <Text color="gray.500">No suggestions right now.</Text>
                    ) : (
                        suggestedUsers.map(user => (
                            <HStack key={user.id} justify="space-between" p={3} bg="gray.50" borderRadius="md">
                                <Box>
                                    <Text fontWeight="bold">{user.userName}</Text>
                                    <Text fontSize="sm" color="gray.500">{user.email}</Text>
                                </Box>
                                <Button size="sm" colorScheme="blue" onClick={() => handleAction("post", `request/${user.id}`, "Friend request sent")}>
                                    Add Friend
                                </Button>
                            </HStack>
                        ))
                    )}
                </VStack>
            </Box>
        </Container>
    );
};

export default FriendsManager;
