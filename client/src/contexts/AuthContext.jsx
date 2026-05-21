import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// STRICT DEBUGGING TOOL
const debugStorage = (action, key, data) => {
  console.log(`[AUTH DEBUG] ${action} ${key}:`, data);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AUTH DEBUG] AuthProvider Mounted. Initializing...");
    
    // 1. Safe Initialization of Users
    try {
      const existing = localStorage.getItem("shelfix_users");
      debugStorage("READ", "shelfix_users", existing);
      
      if (!existing || existing === "[]" || existing === "null") {
        console.log("[AUTH DEBUG] Seeding default users...");
        const defaultUsers = [
          {
            id: `usr_${Date.now()}_admin`,
            name: 'System Administrator',
            username: 'admin1',
            password: 'admin123',
            department: 'System Operations',
            role: 'Admin',
            createdAt: new Date().toISOString()
          },
          {
            id: `usr_${Date.now()}_student`,
            name: 'Demo Student',
            username: 'cs2025',
            password: 'student123',
            department: 'Computer Science',
            role: 'Student',
            createdAt: new Date().toISOString()
          }
        ];
        localStorage.setItem("shelfix_users", JSON.stringify(defaultUsers));
        debugStorage("WRITE", "shelfix_users", defaultUsers);
      }
    } catch(e) {
      console.error("[AUTH DEBUG] Failed to seed users:", e);
    }

    // 2. Safe Restoration of Session
    try {
      const storedSession = localStorage.getItem("shelfix_current_user");
      debugStorage("READ", "shelfix_current_user", storedSession);
      
      if (storedSession && storedSession !== "null" && storedSession !== "undefined") {
        const parsedSession = JSON.parse(storedSession);
        console.log("[AUTH DEBUG] Session restored for user:", parsedSession.username);
        setUser(parsedSession);
      } else {
        console.log("[AUTH DEBUG] No active session found.");
      }
    } catch (e) {
      console.error('[AUTH DEBUG] Failed to parse session, clearing:', e);
      localStorage.removeItem("shelfix_current_user");
    }
    
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const normalizedUsername = (username || '').trim().toLowerCase();
    console.log(`[AUTH DEBUG] Attempting login for: '${normalizedUsername}'`);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let existingUsers = [];
        try {
          const rawUsers = localStorage.getItem("shelfix_users");
          existingUsers = JSON.parse(rawUsers);
          if (!Array.isArray(existingUsers)) {
            existingUsers = [];
          }
        } catch(e) {
          console.error("[AUTH DEBUG] Corrupted shelfix_users during login");
          existingUsers = [];
        }
        
        console.log("Stored Users:", existingUsers);
        console.log("Login Username:", normalizedUsername);
        
        const foundUser = existingUsers.find(u => (u.username || '').trim().toLowerCase() === normalizedUsername);
        
        console.log("Matched User:", foundUser);
        
        if (!foundUser) {
          console.warn(`[AUTH DEBUG] Login Failed: User '${normalizedUsername}' not found in database.`);
          reject(new Error("User not found"));
          return;
        }
        
        if (foundUser.password !== password) {
          console.warn(`[AUTH DEBUG] Login Failed: Incorrect password for '${normalizedUsername}'.`);
          reject(new Error("Incorrect password"));
          return;
        }

        console.log(`[AUTH DEBUG] Login Success for '${normalizedUsername}'. Creating session.`);
        const sessionUser = { ...foundUser };
        delete sessionUser.password;

        setUser(sessionUser);
        localStorage.setItem("shelfix_current_user", JSON.stringify(sessionUser));
        debugStorage("WRITE", "shelfix_current_user", sessionUser);
        
        resolve(sessionUser);
      }, 500);
    });
  };

  const register = async (userData) => {
    const normalizedUsername = (userData.username || '').trim().toLowerCase();
    console.log(`[AUTH DEBUG] Attempting registration for: '${normalizedUsername}'`);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let existingUsers = [];
        try {
          const rawUsers = localStorage.getItem("shelfix_users");
          existingUsers = JSON.parse(rawUsers);
          if (!Array.isArray(existingUsers)) {
            existingUsers = [];
          }
        } catch(e) {
          console.error("[AUTH DEBUG] Corrupted shelfix_users during register");
          existingUsers = [];
        }
        
        const usernameRegex = /^[a-z0-9]{6}$/;
        if (!usernameRegex.test(normalizedUsername)) {
          reject(new Error("Username must be exactly 6 lowercase letters or numbers"));
          return;
        }

        const usernameExists = existingUsers.some(u => (u.username || '').trim().toLowerCase() === normalizedUsername);
        if (usernameExists) {
          console.warn(`[AUTH DEBUG] Register Failed: Username '${normalizedUsername}' already exists.`);
          reject(new Error("Username already exists"));
          return;
        }

        const newUser = {
          id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: userData.name,
          username: normalizedUsername,
          password: userData.password,
          department: userData.department || 'General',
          role: 'Student',
          createdAt: new Date().toISOString(),
          profile: {
            bio: 'Computer Science student passionate about AI and distributed systems.',
            avatar: null,
            joinDate: new Date().toISOString()
          },
          settings: {
            notifications: { dueDates: true, borrowConfirmations: true, overdueAlerts: true, recommendations: false },
            privacy: { profileVisibility: 'Public', activityVisibility: 'Private' },
            appearance: { compactMode: false }
          }
        };

        existingUsers.push(newUser);
        localStorage.setItem("shelfix_users", JSON.stringify(existingUsers));
        debugStorage("WRITE", "shelfix_users (appended)", existingUsers);
        
        // Final sanity check as requested
        console.log("Verification - After registration shelfix_users contains:", JSON.parse(localStorage.getItem("shelfix_users")));

        const sessionUser = { ...newUser };
        delete sessionUser.password;
        
        setUser(sessionUser);
        localStorage.setItem("shelfix_current_user", JSON.stringify(sessionUser));
        debugStorage("WRITE", "shelfix_current_user (auto-login)", sessionUser);
        
        console.log(`[AUTH DEBUG] Registration Success. User ID: ${newUser.id}`);
        resolve(sessionUser);
      }, 500);
    });
  };

  const updateUser = (updates) => {
    console.log(`[AUTH DEBUG] Updating user session data:`, updates);
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("shelfix_current_user", JSON.stringify(updated));
      debugStorage("WRITE", "shelfix_current_user (update)", updated);
      
      try {
        let existingUsers = JSON.parse(localStorage.getItem("shelfix_users"));
        if (!Array.isArray(existingUsers)) {
           existingUsers = [];
        }
        const updatedUsers = existingUsers.map(u => 
          u.id === prev.id ? { ...u, ...updates } : u
        );
        localStorage.setItem("shelfix_users", JSON.stringify(updatedUsers));
        debugStorage("WRITE", "shelfix_users (sync update)", updatedUsers);
      } catch(e) {
        console.error("[AUTH DEBUG] Failed to sync updated user to storage", e);
      }
      return updated;
    });
  };

  const logout = () => {
    console.log("[AUTH DEBUG] Logging out user.");
    setUser(null);
    localStorage.removeItem("shelfix_current_user");
    debugStorage("DELETE", "shelfix_current_user", null);
  };

  const value = {
    user,
    login,
    register,
    updateUser,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

