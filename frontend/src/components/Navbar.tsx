
import React, { useState, useEffect } from "react";
import { Box, Flex, HStack, Button, Heading, Input, List, ListItem, Avatar, Text } from "@chakra-ui/react";
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
        <Box
            as="header"
            position="sticky"
            top={0}
            zIndex={50}
            px={{ base: 4, md: 8 }}
            py={3}
            bg="rgba(255, 255, 255, 0.82)"
            borderBottom="1px solid"
            borderColor="blackAlpha.100"
            backdropFilter="blur(18px)"
        >
            <Flex alignItems="center" justifyContent="space-between" gap={4} maxW="1180px" mx="auto">
                <HStack spacing={{ base: 3, md: 5 }} minW={0}>
                    <Heading
                        size="md"
                        color="#172033"
                        letterSpacing="0"
                        whiteSpace="nowrap"
                    >
                        MiLo
                    </Heading>
                    <HStack spacing={1} display={{ base: "none", md: "flex" }}>
                        <Button 
                            as={Link} 
                            to="/feed" 
                            variant="ghost"
                            bg={location.pathname === "/feed" ? "#172033" : "transparent"}
                            color={location.pathname === "/feed" ? "white" : "gray.700"}
                            borderRadius="full"
                            _hover={{ bg: location.pathname === "/feed" ? "#172033" : "blackAlpha.100" }}
                        >
                            Feed
                        </Button>
                        <Button 
                            as={Link} 
                            to="/friends" 
                            variant="ghost"
                            bg={location.pathname === "/friends" ? "#172033" : "transparent"}
                            color={location.pathname === "/friends" ? "white" : "gray.700"}
                            borderRadius="full"
                            _hover={{ bg: location.pathname === "/friends" ? "#172033" : "blackAlpha.100" }}
                        >
                            Friends
                        </Button>
                        <Button 
                            as={Link} 
                            to="/messenger" 
                            variant="ghost"
                            bg={location.pathname === "/messenger" ? "#172033" : "transparent"}
                            color={location.pathname === "/messenger" ? "white" : "gray.700"}
                            borderRadius="full"
                            _hover={{ bg: location.pathname === "/messenger" ? "#172033" : "blackAlpha.100" }}
                        >
                            Messenger
                        </Button>
                        <Button 
                            as={Link} 
                            to="/profile" 
                            variant="ghost"
                            bg={location.pathname === "/profile" ? "#172033" : "transparent"}
                            color={location.pathname === "/profile" ? "white" : "gray.700"}
                            borderRadius="full"
                            _hover={{ bg: location.pathname === "/profile" ? "#172033" : "blackAlpha.100" }}
                        >
                            Profile
                        </Button>
                    </HStack>
                </HStack>

                {/* Search Bar */}
                <Box position="relative" w={{ base: "min(46vw, 220px)", md: "320px" }}>
                    <Input 
                        placeholder="Search people" 
                        bg="whiteAlpha.900" 
                        color="#172033"
                        border="1px solid"
                        borderColor="blackAlpha.100"
                        borderRadius="full"
                        boxShadow="0 10px 30px rgba(23, 32, 51, 0.08)"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.18)" }}
                    />
                    {searchQuery && (
                        <Box 
                            position="absolute" 
                            top="100%" 
                            left={0} 
                            right={0} 
                            bg="white" 
                            shadow="0 18px 50px rgba(23, 32, 51, 0.16)" 
                            borderRadius="16px" 
                            mt={2} 
                            zIndex={100}
                            maxH="300px"
                            overflowY="auto"
                            border="1px solid"
                            borderColor="blackAlpha.100"
                        >
                            <List spacing={0}>
                                {isSearching ? (
                                    <ListItem p={3} color="gray.600">Searching...</ListItem>
                                ) : searchResults.length > 0 ? (
                                    searchResults.map(user => (
                                        <ListItem 
                                            key={user.id} 
                                            p={3} 
                                            _hover={{ bg: "#f3fbf8", cursor: "pointer" }}
                                            onClick={() => {
                                                setSearchQuery("");
                                                navigate(`/profile/${user.id}`);
                                            }}
                                            display="flex"
                                            alignItems="center"
                                            color="#172033"
                                        >
                                            <Avatar size="sm" src={user.avatar} mr={3} />
                                            <Text fontWeight="medium">{user.userName}</Text>
                                        </ListItem>
                                    ))
                                ) : (
                                    <ListItem p={3} color="gray.600">No users found.</ListItem>
                                )}
                            </List>
                        </Box>
                    )}
                </Box>

                <Button
                    size="sm"
                    onClick={handleLogout}
                    bg="#ff6b6b"
                    color="white"
                    borderRadius="full"
                    _hover={{ bg: "#f05252" }}
                >
                    Logout
                </Button>
            </Flex>
            <HStack spacing={1} display={{ base: "flex", md: "none" }} mt={3} overflowX="auto">
                {[
                    ["/feed", "Feed"],
                    ["/friends", "Friends"],
                    ["/messenger", "Messenger"],
                    ["/profile", "Profile"],
                ].map(([to, label]) => (
                    <Button
                        key={to}
                        as={Link}
                        to={to}
                        size="sm"
                        variant="ghost"
                        bg={location.pathname === to ? "#172033" : "whiteAlpha.700"}
                        color={location.pathname === to ? "white" : "gray.700"}
                        borderRadius="full"
                        flexShrink={0}
                    >
                        {label}
                    </Button>
                ))}
            </HStack>
        </Box>
    );
};

export default Navbar;

