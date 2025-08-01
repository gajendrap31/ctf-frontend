import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { url } from "../Authentication/Utility";

export const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  const [userDetails, setUserDetails] = useState({})
 

  const fetchProfilePicture = async () => {
      const token = localStorage.getItem("Token");
       if (!token) return;
    try {
    
      const res = await axios.get(`${url}/user/profile/image`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        responseType: "blob",
        withCredentials: true,
      });

      const imageUrl = URL.createObjectURL(res.data);
      setProfilePicture(imageUrl);
    } catch (error) {
      setProfilePicture(null); // fallback if no image
    }
  };

 

  const fetchUserDetails = async () => {
    try {
      const token = localStorage.getItem("Token");
      const res = await axios.get(`${url}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
      setUserDetails(res.data);
    } catch (error) {
      setUserDetails({});
    }
  };

  useEffect(() => {
  if (localStorage.getItem("LogIn")) {
    fetchUserDetails();
    fetchProfilePicture();
  }
}, []);
  return (
    <ProfileContext.Provider value={{ profilePicture, setProfilePicture, fetchProfilePicture, userDetails, setUserDetails, fetchUserDetails }}>
      {children}
    </ProfileContext.Provider>
  );
};
