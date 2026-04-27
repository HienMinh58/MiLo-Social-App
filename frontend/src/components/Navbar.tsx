
import React, { useState, useEffect } from "react";
import { Box, Flex, HStack, Button, Heading, Input, InputGroup, InputLeftElement, List, ListItem, Avatar, Text } from "@chakra-ui/react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { disconnectSignalR } from "../services/signalr";
import axios from "axios";
import { API_URL } from "../config/api";

const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    const handleLogout = async () => {
        await disconnectSignalR();
        localStorage.removeItem("jwt");
        navigate("/");
    };

    // Debounced search effect
    useEffect(() => {
        const timeout = setTimeout(async () => {
            if (!searchQuery.trim()) {
                setSearchResults([]);
                return;
            }
            try {
                setIsSearching(true);
                const token = localStorage.getItem("jwt");
                const res = await axios.get(`${API_URL}/profile/search?q=${searchQuery}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSearchResults(res.data);
            } catch (err) {
                console.error("Search failed", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    const token = localStorage.getItem("jwt");
    if (!token) return null; // Don't show navbar if not logged in

    return (
        <Box bg="#2196f3" px={8} py={3} shadow="md">
            <Flex alignItems="center" justifyContent="space-between">
                <HStack spacing={4}>
                    <Heading size="md" color="white" mr={6}>MiLo</Heading>
                    <HStack spacing={2}>
                        <Button 
                            as={Link} 
                            to="/feed" 
                            variant={location.pathname === "/feed" ? "solid" : "ghost"} 
                            colorScheme="whiteAlpha"
                            color="white"
                        >
                            Feed
                        </Button>
                        <Button 
                            as={Link} 
                            to="/friends" 
                            variant={location.pathname === "/friends" ? "solid" : "ghost"} 
                            colorScheme="whiteAlpha"
                            color="white"
                        >
                            Friends
                        </Button>
                        <Button 
                            as={Link} 
                            to="/messenger" 
                            variant={location.pathname === "/messenger" ? "solid" : "ghost"} 
                            colorScheme="whiteAlpha"
                            color="white"
                        >
                            Messenger
                        </Button>
                        <Button 
                            as={Link} 
                            to="/profile" 
                            variant={location.pathname === "/profile" ? "solid" : "ghost"} 
                            colorScheme="whiteAlpha"
                            color="white"
                        >
                            Profile
                        </Button>
                    </HStack>
                </HStack>

                {/* Search Bar */}
                <Box position="relative" w="300px">
                    <Input 
                        placeholder="Search users..." 
                        bg="white" 
                        color="black"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <Box 
                            position="absolute" 
                            top="100%" 
                            left={0} 
                            right={0} 
                            bg="white" 
                            shadow="xl" 
                            borderRadius="md" 
                            mt={1} 
                            zIndex={100}
                            maxH="300px"
                            overflowY="auto"
                        >
                            <List spacing={0}>
                                {isSearching ? (
                                    <ListItem p={3} color="black">Searching...</ListItem>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <ListItem 
                                            key={user.id} 
                                            p={3} 
                                            _hover={{ bg: "gray.100", cursor: "pointer" }}
                                            onClick={() => {
                                                setSearchQuery("");
                                                navigate(`/profile/${user.id}`);
                                            }}
                                            display="flex"
                                            alignItems="center"
                                            color="black"
                                        >
                                            <Avatar size="sm" src={user.avatar} mr={3} />
                                            <Text fontWeight="medium">{user.userName}</Text>
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem p={3} color="black">No users found.</ListItem>
                                )}
                            </List>
                        </Box>
                    )}
                </Box>

                <Button colorScheme="red" variant="solid" size="sm" onClick={handleLogout}>
                    Logout
                </Button>
            </Flex>
        </Box>
    );
};

export default Navbar;

