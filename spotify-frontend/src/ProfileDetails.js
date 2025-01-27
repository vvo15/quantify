// ProfileDetails.js
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
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '30px', // move 30px down
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '20px',
        }}
      >
        Welcome,
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '14px',
          marginTop: '5px',
        }}
      >
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
