import React, { useEffect, useState } from "react";
import { Box, Button, Container, Heading, Input, Text, Textarea, VStack, Image, HStack } from "@chakra-ui/react";
import axios from "axios";
import { API_URL } from "../config/api";
import { useParams } from "react-router-dom";

interface userProfile {
    userName: string;
    Email: string;
    Bio?: string;
    Avatar?: string
}

const Profile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [profile, setProfile] = useState<userProfile>({ userName: '', Email: '', Bio: '', Avatar: ''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editBio, setEditBio] = useState("");
    const [editAvatar, setEditAvatar] = useState("");
    const [saving, setSaving] = useState(false);

    // Is this the logged-in user's profile?
    const isMyProfile = !userId;

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError('');

                const token = localStorage.getItem("jwt");
                const url = userId ? `${API_URL}/profile/${userId}` : `${API_URL}/profile/me`;

                const response = await axios.get(url, {
                    headers : {
                        Authorization: `Bearer ${token}`,
                        "Content-type" : "application/json",
                    },
                });

                setProfile(response.data);
                if (isMyProfile) {
                    setEditBio(response.data.Bio || "");
                    setEditAvatar(response.data.Avatar || "");
                }
            } catch(error: any) {
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
            const response = await axios.put(`${API_URL}/profile/edit`, 
                { Bio: editBio, AvatarUrl: editAvatar },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
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

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!profile) return <p>No profile found.</p>;

    return(
        <Container maxW="md" py={10}>
            <Box bg="white" p={8} shadow="lg" borderRadius="lg" textAlign="center">
                {profile.Avatar ? (
                    <Image
                        src={profile.Avatar}
                        alt={`${profile.userName}'s avatar`}
                        boxSize="150px"
                        borderRadius="full"
                        mx="auto"
                        mb={4}
                        objectFit="cover"
                        border="4px solid #2196f3"
                    />
                ) : (
                    <Box boxSize="150px" borderRadius="full" bg={"gray.200"} mx={"auto"} mb={4} display="flex" alignItems="center" justifyContent="center">
                        <Text color={"gray.500"}>No Avatar</Text>
                    </Box>
                )}

                <Heading size="lg" mb={2}>{profile.userName}</Heading>
                <Text color="gray.500" mb={4}>{profile.Email}</Text>

                {isEditing ? (
                    <VStack spacing={4} mt={4}>
                        <Box w="100%">
                            <Text fontSize="sm" fontWeight="bold" textAlign="left" mb={1}>Avatar URL</Text>
                            <Input 
                                placeholder="https://example.com/image.jpg" 
                                value={editAvatar}
                                onChange={(e) => setEditAvatar(e.target.value)}
                            />
                        </Box>
                        <Box w="100%">
                            <Text fontSize="sm" fontWeight="bold" textAlign="left" mb={1}>Bio</Text>
                            <Textarea 
                                placeholder="Tell us about yourself..." 
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                            />
                        </Box>
                        <HStack spacing={4} mt={4}>
                            <Button colorScheme="blue" onClick={handleSave} isLoading={saving}>Save</Button>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                        </HStack>
                    </VStack>
                ) : (
                    <Box mt={4}>
                        {profile.Bio ? (
                            <Text fontStyle="italic" color="gray.700">"{profile.Bio}"</Text>
                        ) : (
                            <Text color="gray.400">No bio provided.</Text>
                        )}
                        
                        {isMyProfile ? (
                            <Button mt={6} colorScheme="blue" onClick={() => setIsEditing(true)}>
                                Edit Profile
                            </Button>
                        ) : (
                            <Button mt={6} colorScheme="green" onClick={async () => {
                                try {
                                    const token = localStorage.getItem("jwt");
                                    await axios.post(`${API_URL}/friends/request/${userId}`, {}, {
                                        headers: { Authorization: `Bearer ${token}` }
                                    });
                                    alert("Friend request sent!");
                                } catch (err: any) {
                                    alert(err.response?.data || "Failed to send request.");
                                }
                            }}>
                                Add Friend
                            </Button>
                        )}
                    </Box>
                )}
            </Box>
        </Container>
    )
};

export default Profile;