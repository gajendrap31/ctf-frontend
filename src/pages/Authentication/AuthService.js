// auth.service.js

import { jwtDecode } from "jwt-decode";
import axios from 'axios';
import { url } from './Utility';

const AuthService = {
  getToken: () => {
    return localStorage.getItem('Token');
  },

  isTokenValid: (token) => {
    try {
      // const token = localStorage.getItem("Token");
      if (!token) return;
      const decodedToken = jwtDecode(token);
      const expirationTime = decodedToken.exp * 1000;
      return Date.now() < expirationTime;
    } catch (error) {
      return false;
    }
  },

  removeToken: () => {
    localStorage.removeItem('jwtToken');
  },

  isLoggedIn: () => {
    const token = AuthService.getToken();
    return token && AuthService.isTokenValid(token);
  },

  logout: async ({ setUserDetails, setNotifications, setProfilePicture, navigate }) => {
    try {
      const token = localStorage.getItem('Token');

      let userId;
      let role;
      if (token) {
        const decodedToken = jwtDecode(token);
        userId = decodedToken.sub;
        role = decodedToken.role;
      }

      if (userId && token && role === "ROLE_USER") {
        
        // Disconnect SSE or other active connections
        await axios.delete(`${url}/user/${userId}/connections`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        // Clear the team submission updates for this user
        await axios.delete(`${url}/user/${userId}/update`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

      }
    } catch (error) {
      
    } finally {
      setNotifications?.([]);
      localStorage.removeItem('notifications');
      localStorage.removeItem('Token');
      localStorage.removeItem('LogIn');
      localStorage.removeItem('LogOut');
      localStorage.removeItem('User_Role');
      setProfilePicture?.(null);
      setUserDetails?.(null);
      navigate('/');
    }
  },
};

export default AuthService;
