import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Divider,
  Heading,
  HStack,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { API_URL } from "../config/api";

interface User {
  id: string;
  userName: string;
  email?: string;
  avatar?: string;
}

interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: User;
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

      if (Array.isArray(res.data)) {
        setPosts(res.data);
      } else {
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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <Box minH="100vh" pt={{ base: 6, md: 8 }} pb={12}>
      <Container maxW="720px">
        <Box mb={6} textAlign="left">
          <Badge bg="#26cba3" color="white" borderRadius="full" px={3} py={1} mb={3}>
            Live feed
          </Badge>
          <Heading size={{ base: "lg", md: "xl" }} color="#172033" letterSpacing="0">
            Hom nay ban muon chia se gi?
          </Heading>
          <Text color="gray.600" mt={2}>
            Bat trend, cap nhat ban be va giu cuoc tro chuyen luon co nhip.
          </Text>
        </Box>

        <Box
          bg="rgba(255, 255, 255, 0.9)"
          p={6}
          borderRadius="24px"
          boxShadow="0 22px 70px rgba(23, 32, 51, 0.12)"
          border="1px solid"
          borderColor="whiteAlpha.800"
          mb={8}
        >
          <VStack spacing={3} align="stretch">
            <Textarea
              placeholder="Viet mot dieu that MiLo..."
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              minH="120px"
              resize="vertical"
              bg="#fbfaf7"
              border="1px solid"
              borderColor="blackAlpha.100"
              borderRadius="18px"
              _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
            />

            <Button
              bg="#172033"
              color="white"
              alignSelf="flex-end"
              onClick={handleCreatePost}
              isDisabled={!newPost.trim()}
              borderRadius="full"
              px={7}
              _hover={{ bg: "#25324d", transform: "translateY(-1px)" }}
            >
              Dang bai
            </Button>
          </VStack>
        </Box>

        <VStack spacing={6} align="stretch">
          {posts.map((post) => (
            <Box
              key={post.id}
              bg="rgba(255, 255, 255, 0.92)"
              p={6}
              borderRadius="24px"
              boxShadow="0 18px 48px rgba(23, 32, 51, 0.09)"
              border="1px solid"
              borderColor="whiteAlpha.800"
              _hover={{ transform: "translateY(-2px)", boxShadow: "0 24px 70px rgba(23, 32, 51, 0.13)" }}
              transition="0.2s ease"
            >
              <HStack justify="space-between" mb={4} align="flex-start">
                <HStack spacing={3}>
                  <Avatar src={post.user.avatar} name={post.user.userName} size="md" bg="#26cba3" color="white" />
                  <Box textAlign="left">
                    <Text fontWeight="800" color="#172033">
                      {post.user.userName}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {post.user.email || "MiLo creator"}
                    </Text>
                  </Box>
                </HStack>

                <Text fontSize="sm" color="gray.500" textAlign="right">
                  {new Date(post.createdAt).toLocaleString()}
                </Text>
              </HStack>

              <Text mb={4} color="gray.800" fontSize="md" lineHeight="1.75" textAlign="left">
                {post.content}
              </Text>

              <HStack spacing={3} mb={4}>
                <Badge bg="#fff0e8" color="#d95d39" borderRadius="full" px={3} py={1}>
                  {post.likesCount} likes
                </Badge>
                <Badge bg="#edf7f4" color="#16866d" borderRadius="full" px={3} py={1}>
                  {post.comments.length} comments
                </Badge>
              </HStack>

              <Divider mb={4} />

              <VStack align="stretch" spacing={3}>
                <Text fontWeight="800" color="#172033">
                  Comments
                </Text>

                {post.comments.map((comment) => (
                  <Box key={comment.id} p={3} bg="#fbfaf7" borderRadius="16px" textAlign="left">
                    <Text fontWeight="bold" fontSize="sm">
                      {comment.user.userName}
                    </Text>
                    <Text fontSize="sm" color="gray.700">
                      {comment.content}
                    </Text>
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
