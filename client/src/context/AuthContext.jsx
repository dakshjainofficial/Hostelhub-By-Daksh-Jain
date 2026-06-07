import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Fetch current user details
  const fetchUser = async (authToken) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
        return data.data.user;
      } else {
        logout();
      }
    } catch (err) {
      console.error('Fetch user failed:', err);
      logout();
    }
    return null;
  };

  // Login handler
  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return { success: true };
    }
    return { success: false, message: data.message || 'Login failed' };
  };

  // Register handler
  const register = async (name, email, password, hostel) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, hostel }),
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('token', data.data.token);
      setToken(data.data.token);
      setUser(data.data.user);
      return { success: true };
    }
    return { success: false, message: data.message || 'Registration failed' };
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
  };

  // Fetch counts (unread messages, notifications)
  const fetchCounts = async (authToken) => {
    try {
      // Unread messages
      const msgRes = await fetch('/api/conversations/unread-count', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const msgData = await msgRes.json();
      if (msgData.success) setUnreadMessages(msgData.data.unreadCount);

      // Unread notifications
      const notifRes = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const notifData = await notifRes.json();
      if (notifData.success) setUnreadNotifications(notifData.data.unreadCount);
    } catch (err) {
      console.error('Fetch counts failed:', err);
    }
  };

  // Initialize socket when token/user is available
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchUser(token).then((currUser) => {
        if (currUser) {
          fetchCounts(token);
          
          // Connect socket
          const socketConnection = io({
            auth: { token },
          });

          socketConnection.on('connect', () => {
            console.log('⚡ Socket connected to server');
          });

          socketConnection.on('onlineUsers', (users) => {
            setOnlineUsers(users);
          });

          // Live messages listener (for global counts)
          socketConnection.on('newMessage', (msg) => {
            if (msg.senderId !== currUser._id) {
              setUnreadMessages((prev) => prev + 1);
            }
          });

          // Live notifications listener
          socketConnection.on('notification', (notif) => {
            setUnreadNotifications((prev) => prev + 1);
            setNotifications((prev) => [notif, ...prev]);
          });

          setSocket(socketConnection);
        }
        setLoading(false);
      });
    } else {
      setUser(null);
      setLoading(false);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        socket,
        onlineUsers,
        unreadMessages,
        setUnreadMessages,
        unreadNotifications,
        setUnreadNotifications,
        notifications,
        setNotifications,
        refreshCounts: () => fetchCounts(token),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
