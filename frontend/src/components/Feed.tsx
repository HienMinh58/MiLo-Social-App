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
import Navbar from "./Navbar";
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

    return (
        <Box bg="gray.50" minH="100vh">
      
          <Navbar />
      
          <Container maxW="600px" pt="100px">
      
            {/* CREATE POST */}
            <Box
              bg="white"
              p={6}
              borderRadius="xl"
              boxShadow="sm"
              mb={8}
            >
              <VStack spacing={3} align="stretch">
                <Textarea
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                />
      
                <Button
                  colorScheme="blue"
                  alignSelf="flex-end"
                  onClick={handleCreatePost}
                  isDisabled={!newPost.trim()}
                >
                  Post
                </Button>
              </VStack>
            </Box>
      
            {/* POSTS */}
            <VStack spacing={6} align="stretch">
              {posts.map((post) => (
                <Box
                  key={post.id}
                  bg="white"
                  p={6}
                  borderRadius="xl"
                  boxShadow="sm"
                  _hover={{ boxShadow: "md" }}
                  transition="0.2s"
                >
      
                  {/* HEADER */}
                  <HStack justify="space-between" mb={4}>
                    <Text fontWeight="bold">
                      {post.user.userName}
                    </Text>
      
                    <Text fontSize="sm" color="gray.500">
                      {new Date(post.createdAt).toLocaleString()}
                    </Text>
                  </HStack>
      
                  {/* CONTENT */}
                  <Text mb={4}>
                    {post.content}
                  </Text>
      
                  {/* LIKES */}
                  <Text fontSize="sm" color="gray.600" mb={4}>
                    👍 {post.likesCount} Likes
                  </Text>
      
                  <Divider mb={4} />
      
                  {/* COMMENTS */}
                  <VStack align="stretch" spacing={3}>
                    <Text fontWeight="bold">Comments</Text>
      
                    {post.comments.map((c) => (
                      <Box
                        key={c.id}
                        pl={4}
                        borderLeft="2px solid"
                        borderColor="gray.200"
                      >
                        <Text fontWeight="bold" fontSize="sm">
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
        </Box>
      );
                    };
export default Feed;