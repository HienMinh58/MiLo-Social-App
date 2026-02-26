import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    Container,
    Text,
    Textarea,
    VStack,
    HStack,
    Divider,
} from "@chakra-ui/react";
import { API_URL } from '../config/api';
interface User {
    id: string;
    userName: string;
    email?: string
}

interface Comment {
    id: number;
    content: string;
    createdAt: string;
    user: User
}

interface Post {
    id: number;
    content: string;
    createdAt: string;
    user: User;
    likesCount: number;
    isLikedByMe: boolean;
    comments: Comment[];
}

const Feed: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState<string>("");

    const token = localStorage.getItem("jwt");

    const fetchPosts = async () => {
        try {
            const res = await axios.get<Post[]>(`${API_URL}/post`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if(Array.isArray(res.data)){
                setPosts(res.data);
            }
            else {
                console.log("Type of res.data:", typeof res.data); 
                console.error("Expected posts array but got: ", res.data);
                setPosts([]);
            }
        } catch (error) {
            console.error(error);
            setPosts([]);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;
        try {
            const res = await axios.post<Post>(
                `${API_URL}/post`, 
                { content: newPost },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );
            setPosts([res.data, ...posts]);
            setNewPost("");
        } catch(error) {
            console.error(error);
        };
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    return(
        <Container maxW={"600px"} py={8} px={12}>
            <Box mb={8}>
                <VStack spacing={3} align={"stretch"}>
                    <Textarea
                    placeholder="What's on your mind?"
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    rows={3}
                    size={"md"}
                    resize={"vertical"}
                    />
                    <Button 
                        colorScheme="blue"
                        onClick={handleCreatePost}
                        isDisabled={!newPost.trim()}
                        alignSelf={"flex-end"}
                        px={8}
                    >
                        Post
                    </Button>
                </VStack>
            </Box>

            <VStack spacing={6} align={"stretch"}>
                {posts.map((post) => (
                    <Box
                        key={post.id}
                        borderWidth={"1px"}
                        borderColor={"gray.200"}
                        borderRadius={"lg"}
                        p={6}
                        bg={"white"}
                        boxShadow={"sm"}
                    >
                        <HStack justifyContent={"space-between"} mb={4}>
                            <Text fontWeight={"bold"} fontSize={"lg"}>
                                {post.user.userName}
                            </Text>
                            <Text fontSize={"sm"} color={"gray.500"}>
                                {new Date(post.createdAt).toLocaleString()}
                            </Text>
                        </HStack>
                        <Text mb={5} fontSize={"md"}>
                            {post.content}
                        </Text>
                        <Text mb={5} fontWeight={"medium"} color={"gray.600"}>
                            Likes: {post.likesCount}{" "}
                            {post.isLikedByMe ? "You liked" : ""}
                        </Text>

                        <Divider mb={5} />

                        <VStack align={"stretch"} spacing={3}>
                            <Text fontWeight={"semibold"} mb={2}>
                                Comments:
                            </Text>
                            {post.comments.map((c) => (
                                <Box
                                    key={c.id}
                                    pl={4}
                                    borderLeft={"2px solid"}
                                    borderColor={"gray.200"}
                                    py={1}
                                >
                                    <Text fontWeight={"bold"} fontSize={"sm"}>
                                        {c.user.userName}
                                    </Text>
                                    <Text fontSize="sm">{c.content}</Text>
                                </Box>
                            ))}
                        </VStack>
                    </Box>
                ))}
            </VStack>
        </Container>
    );
};

export default Feed;