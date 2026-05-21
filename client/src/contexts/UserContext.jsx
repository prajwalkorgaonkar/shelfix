import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

const defaultSettings = {
  notifications: {
    dueDates: true,
    borrowConfirmations: true,
    overdueAlerts: true,
    recommendations: false
  },
  privacy: {
    profileVisibility: 'Public',
    activityVisibility: 'Private'
  },
  appearance: {
    compactMode: false
  }
};

const defaultProfile = {
  bio: 'Computer Science student passionate about AI and distributed systems.',
  avatar: null,
  joinDate: new Date().toISOString()
};

export const UserProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  
  const [profile, setProfile] = useState(defaultProfile);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    if (user) {
      setProfile(user.profile || defaultProfile);
      setSettings(user.settings || defaultSettings);
    } else {
      setProfile(defaultProfile);
      setSettings(defaultSettings);
    }
  }, [user]);

  const updateProfile = (newProfile) => {
    const updated = { ...profile, ...newProfile };
    setProfile(updated);
    if (user) {
      updateUser({ profile: updated });
    }
  };

  const updateSettings = (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    if (user) {
      updateUser({ settings: updated });
    }
  };

  return (
    <UserContext.Provider value={{ profile, settings, updateProfile, updateSettings }}>
      {children}
    </UserContext.Provider>
  );
};
