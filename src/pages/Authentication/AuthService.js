// auth.service.js

import { jwtDecode } from "jwt-decode";

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

  // Additional methods for login, logout, etc.
};

export default AuthService;
