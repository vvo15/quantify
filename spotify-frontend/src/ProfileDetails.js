import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from './AuthContext';

function ProfileDetails() {
  const { accessToken } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!accessToken) return;

    async function fetchProfile() {
      try {
        const response = await fetch(
          `http://localhost:8080/api/me?access_token=${accessToken}`
        );
        const data = await response.json();
        setProfile(data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    fetchProfile();
  }, [accessToken]);

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column', // column to place "Welcome," above row
        alignItems: 'center',
        marginTop: '5px', // Slightly reduced space above
      }}
    >
      {/* Larger "Welcome," */}
      <p
        style={{
          margin: 0,
          fontSize: '20px', // Make "Welcome," bigger
        }}
      >
        Welcome,
      </p>

      {/* Row with the profile pic on the left, name on the right */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '14px', // space between pic & name
          marginTop: '5px',
        }}
      >
        {/* Profile Picture */}
        {profile.images && profile.images.length > 0 && (
          <img
            src={profile.images[0].url}
            alt="Profile"
            style={{
              width: '80px',
              borderRadius: '50%',
            }}
          />
        )}

        {/* User's Name */}
        <h2
          style={{
            margin: 0,
            fontWeight: 'normal',
          }}
        >
          {profile.display_name}
        </h2>
      </div>
    </div>
  );
}

export default ProfileDetails;
