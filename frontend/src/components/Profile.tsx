import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../config/api";
interface userProfile {
    userName: string;
    Email: string;
    Bio?: string;
    Avatar?: string
}

interface ProfileProps {
    userId?: string
}

const Profile: React.FC<ProfileProps> = ({userId}) => {
    const [profile, setProfile] = useState<userProfile>({ userName: '', Email: '', Bio: '', Avatar: ''});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

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
            } catch(error: any) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    if (loading) return <p>Loading profile...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!profile) return <p>No profile found.</p>;

    return(
        <div className="profile-container">
            {profile.Avatar &&(
                <img
                    src={profile.Avatar}
                    alt={`${profile.userName}'s avatar`}
                    className="profile-avatar"
                />
            )}
            <h2>{profile.userName}</h2>
            <p>Email: {profile.Email}</p>
            {profile.Bio && <p>Bio: {profile.Bio}</p>}
        </div>
    )
};

export default Profile;