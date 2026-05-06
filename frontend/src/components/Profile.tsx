import React, { useEffect, useState } from "react";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Input,
  Text,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { API_URL } from "../config/api";
import { useParams } from "react-router-dom";

interface UserProfile {
  userName: string;
  Email: string;
  Bio?: string;
  Avatar?: string;
}

const Profile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfile>({ userName: "", Email: "", Bio: "", Avatar: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);

  const isMyProfile = !userId;

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("jwt");
        const url = userId ? `${API_URL}/profile/${userId}` : `${API_URL}/profile/me`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
          },
        });

        setProfile(response.data);
        if (isMyProfile) {
          setEditBio(response.data.Bio || "");
          setEditAvatar(response.data.Avatar || "");
        }
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, isMyProfile]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("jwt");
      const response = await axios.put(
        `${API_URL}/profile/edit`,
        { Bio: editBio, AvatarUrl: editAvatar },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      setProfile(response.data);
      setIsEditing(false);
    } catch (err: any) {
      console.error("Failed to save profile", err);
      setError(err.message || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxW="720px" py={10}>
        <Text color="gray.600">Loading profile...</Text>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="720px" py={10}>
        <Text color="red.500">Error: {error}</Text>
      </Container>
    );
  }

  if (!profile) {
    return (
      <Container maxW="720px" py={10}>
        <Text>No profile found.</Text>
      </Container>
    );
  }

  return (
    <Box minH="100vh" py={{ base: 6, md: 10 }}>
      <Container maxW="860px">
        <Box
          overflow="hidden"
          bg="rgba(255, 255, 255, 0.92)"
          borderRadius="28px"
          boxShadow="0 26px 80px rgba(23, 32, 51, 0.14)"
          border="1px solid"
          borderColor="whiteAlpha.800"
        >
          <Box
            h={{ base: "150px", md: "210px" }}
            bg="linear-gradient(135deg, #172033 0%, #26cba3 52%, #ff8a5c 100%)"
            position="relative"
          >
            <Badge
              position="absolute"
              right={5}
              top={5}
              bg="whiteAlpha.900"
              color="#172033"
              borderRadius="full"
              px={3}
              py={1}
            >
              {isMyProfile ? "My space" : "MiLo profile"}
            </Badge>
          </Box>

          <Box px={{ base: 5, md: 8 }} pb={8} mt="-64px">
            <Avatar
              src={profile.Avatar}
              name={profile.userName}
              size="2xl"
              bg="#26cba3"
              color="white"
              border="6px solid white"
              boxShadow="0 18px 44px rgba(23, 32, 51, 0.22)"
            />

            <HStack justify="space-between" align="flex-start" mt={5} spacing={4} flexWrap="wrap">
              <Box textAlign="left">
                <Heading size="xl" color="#172033" letterSpacing="0">
                  {profile.userName}
                </Heading>
                <Text color="gray.500" mt={1}>
                  {profile.Email}
                </Text>
              </Box>

              {!isEditing && (
                isMyProfile ? (
                  <Button
                    bg="#172033"
                    color="white"
                    borderRadius="full"
                    px={6}
                    onClick={() => setIsEditing(true)}
                    _hover={{ bg: "#25324d", transform: "translateY(-1px)" }}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <Button
                    bg="#26cba3"
                    color="white"
                    borderRadius="full"
                    px={6}
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("jwt");
                        await axios.post(`${API_URL}/friends/request/${userId}`, {}, {
                          headers: { Authorization: `Bearer ${token}` },
                        });
                        alert("Friend request sent!");
                      } catch (err: any) {
                        alert(err.response?.data || "Failed to send request.");
                      }
                    }}
                    _hover={{ bg: "#20ae8c", transform: "translateY(-1px)" }}
                  >
                    Add Friend
                  </Button>
                )
              )}
            </HStack>

            {isEditing ? (
              <VStack spacing={4} mt={8} align="stretch">
                <Box>
                  <Text fontSize="sm" fontWeight="800" textAlign="left" mb={2}>
                    Avatar URL
                  </Text>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    bg="#fbfaf7"
                    borderRadius="16px"
                    borderColor="blackAlpha.100"
                    _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
                  />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="800" textAlign="left" mb={2}>
                    Bio
                  </Text>
                  <Textarea
                    placeholder="Tell us about yourself..."
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    bg="#fbfaf7"
                    borderRadius="16px"
                    minH="130px"
                    borderColor="blackAlpha.100"
                    _focus={{ borderColor: "#26cba3", boxShadow: "0 0 0 3px rgba(38, 203, 163, 0.16)" }}
                  />
                </Box>
                <HStack spacing={3} justify="flex-end">
                  <Button bg="#172033" color="white" borderRadius="full" onClick={handleSave} isLoading={saving}>
                    Save
                  </Button>
                  <Button variant="outline" borderRadius="full" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </HStack>
              </VStack>
            ) : (
              <Box mt={8} p={5} bg="#fbfaf7" borderRadius="22px" textAlign="left">
                <Text fontSize="sm" color="gray.500" fontWeight="800" mb={2}>
                  Bio
                </Text>
                {profile.Bio ? (
                  <Text color="gray.800" fontSize="lg" lineHeight="1.7">
                    {profile.Bio}
                  </Text>
                ) : (
                  <Text color="gray.500">No bio provided.</Text>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Profile;
