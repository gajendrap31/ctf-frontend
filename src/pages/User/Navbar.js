import { useState, useEffect, useMemo, useRef, useCallback, useContext } from 'react';
import { MdNotifications, MdHelp, MdMailOutline } from 'react-icons/md';
import { ImMenu } from 'react-icons/im';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { url } from '../Authentication/Utility';
import AuthService from '../Authentication/AuthService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDistanceToNow, isToday, isThisWeek, parseISO, format } from 'date-fns';
import { EventSourcePolyfill } from 'event-source-polyfill';
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import { ProfileContext } from '../Context API/ProfileContext';
function Navbar({ value, setValue, setUserActivity }) {
  const failureCount = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  //const [profilePicture, setProfilePicture] = useState()
  const [isOpenNotification, setIsOpenNotification] = useState(false);
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage on mount
    const savedNotifications = localStorage.getItem("notifications");
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  // const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem('Token'), []);
  const { profilePicture, userDetails } = useContext(ProfileContext);
  const { setProfilePicture, setUserDetails } = useContext(ProfileContext);
  // Responsive Sidebar Toggle
  useEffect(() => {
    function checkScreenSize() {
      setValue(window.innerWidth > 768);
    }

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, [setValue]);

  // Axios Instance
  const axiosInstance = axios.create({
    baseURL: url,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": 'application/json',
    },
    withCredentials: true,
  });



  useEffect(() => {
    if (!userDetails?.id) return;

    let lastMessageTime = Date.now();
    let heartbeatTimer;

    const connectEventSource = () => {
      const es = new EventSourcePolyfill(`${url}/notification/${userDetails.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      es.onmessage = (event) => {
        if (!event.data) return;
        const data = JSON.parse(event.data);

        lastMessageTime = Date.now();

        if (data.eventType === "KEEP_ALIVE") return;

        // Clear all notifications
        if (data.clear && data.all) {
          setNotifications([]);
          localStorage.removeItem("notifications");  // clear from localStorage as well
          setUserActivity?.(data);
          return;
        }

        // Clear notifications for a specific eventId
        if (data.clear && data.eventId) {
          setNotifications(prev => {
            const filtered = prev.filter(notif => notif.eventId !== data.eventId);
            localStorage.setItem("notifications", JSON.stringify(filtered));
            return filtered;
          });
          setUserActivity?.(data);
          return;
        }

        // Normal notification flow
        setUserActivity?.(data);
        setNotifications(prev => {
          let updated = [...prev, data];
          updated = updated.filter(
            (notif, index, self) =>
              index === self.findIndex(
                t => t.eventId === notif.eventId && t.message === notif.message
              )
          );
          localStorage.setItem("notifications", JSON.stringify(updated));
          return updated;
        });

        if (data.message && !data.read) {
          toast.info(data.message);
        }
      };


      es.onerror = (error) => {
        console.warn("SSE connection error:", error);
        es.close();
        setTimeout(connectEventSource, 3000);
      };

      // Heartbeat watchdog: check every 30s if last message > 60s ago
      heartbeatTimer = setInterval(() => {
        if (Date.now() - lastMessageTime > 60000) {
          console.warn("No SSE messages for 60s, reconnecting...");
          es.close();
          clearInterval(heartbeatTimer);
          connectEventSource();
        }
      }, 30000);

      return es;
    };

    const es = connectEventSource();

    return () => {
      es.close();
      clearInterval(heartbeatTimer);
    };
  }, [userDetails?.id]);




  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('LogIn');
    localStorage.removeItem('LogOut');
    localStorage.removeItem('User_Role');
    //localStorage.clear();
    setProfilePicture(null);
    setUserDetails(null);
    navigate('/');
  };

  // Token Validation
  useEffect(() => {
    const token = AuthService.getToken();
    if (!AuthService.isTokenValid(token)) {
      navigate('/');
    }
  }, []);

  const dropdownRef = useRef(null);

  // Function to toggle the dropdown
  const toggleDropdown = () => {
    setIsOpenNotification((prev) => !prev);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpenNotification(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatNotificationTime = (isoString) => {
    if (!isoString || typeof isoString !== "string") {
      return "Invalid Date";
    }

    try {
      const date = parseISO(isoString); // No need to strip timezone info

      if (isNaN(date.getTime())) return "Invalid Date";

      if (isToday(date)) {
        return formatDistanceToNow(date, { addSuffix: true });
      }

      if (isThisWeek(date)) {
        return format(date, "EEEE");
      }

      return format(date, "MMM d, yyyy");
    } catch (error) {
      return "Invalid Date";
    }
  };

  const [clearing, setClearing] = useState(false);

  const handleClearAll = async () => {
    if (clearing) return;
    setClearing(true);
    try {
      const userId = userDetails?.id;
      if (!userId) return;

      await axiosInstance.delete(`/notification/clear/user/${userId}`);

      setNotifications([]);
      localStorage.removeItem("notifications");
    } catch (error) {

    } finally {
      setClearing(false);
    }
  };



  return (
    <div className="h-16 w-full text-gray-700 font-Lexend_Bold flex justify-between items-center px-4 bg-gray-100">
      {/* Left Div */}
      <div className="flex items-center">
        {!value && (
          <div className="flex items-center">
            <div
              className="p-2 rounded-lg hover:bg-gray-300 cursor-pointer"
              onClick={() => setValue(!value)}
            >
              <ImMenu size={24} />
            </div>
            <img
              className="rounded-full h-12 w-12 ml-2"
              src="/cdacLogo.png"
              alt="CDAC Logo"
              loading="lazy"
            />
            <div className="hidden sm:flex flex-col ml-2">
              <p className="text-sky-700 text-lg">CDAC</p>
              <span className="text-gray-700 text-sm">Capture the Flag</span>
            </div>
          </div>
        )}
      </div>

      {/* Right Div */}
      <div className="flex items-center space-x-2">
        <ul className="flex items-center space-x-2 relative">
          {/* Notification Bell */}
          <div ref={dropdownRef} className="relative">
            <li
              className={`relative hover:bg-gray-300 h-10 w-10 rounded-lg flex items-center justify-center ${isOpenNotification ? "bg-gray-300" : ""
                }`}
              ref={dropdownRef}
              onClick={toggleDropdown}
            >
              <MdNotifications size={24} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </li>

            {/* Notifications Dropdown */}
            {isOpenNotification && (
              <div className="absolute top-14 right-0 w-72 sm:w-80 md:w-96 bg-white border border-gray-300 shadow-lg rounded-lg p-2 z-20 max-h-96 overflow-auto">
                <h3 className="text-lg font-semibold text-gray-800 border-b p-2 flex justify-between items-center">
                  Notifications
                  {notifications.length > 0 && (
                    <button
                      className="text-xs text-gray-600 font-regular hover:text-gray-800 cursor-pointer disabled:opacity-50"
                      onClick={handleClearAll}
                      disabled={clearing}
                    >
                      Clear All
                    </button>
                  )}
                </h3>
                <ul className="max-h-80 overflow-auto">
                  {notifications.length > 0 ? (
                    notifications
                      .map((notif) => {
                        console.log(notif);
                        const timeStr = typeof notif.notificationTime === 'string' ? notif.notificationTime.split("[")[0] : null;
                        return {
                          ...notif,
                          parsedTime: timeStr ? new Date(timeStr) : new Date(0), // fallback date if invalid
                        };
                      })
                      .sort((a, b) => b.parsedTime - a.parsedTime)
                      .map((notif, index) => (
                        <li
                          key={`${notif.eventId}-${index}`}
                          className={`p-3 text-gray-700 font-Lexend_Regular border-b flex items-start justify-between last:border-none ${notif.read ? "bg-white" : "bg-blue-50"
                            }`}
                        >
                          <div className="pr-2 w-full">
                            <p className="text-sm">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatNotificationTime(notif.notificationTime)}
                            </p>
                          </div>
                          {/* <RiDeleteBin6Line
                            size={18}
                            className="text-red-500 cursor-pointer"
                            onClick={() => {
                              setNotifications(prev => {
                                const filtered = prev.filter((_, i) => i !== index);
                                localStorage.setItem("notifications", JSON.stringify(filtered));
                                return filtered;
                              });
                            }}
                          /> */}
                        </li>
                      ))
                  ) : (
                    <li className="p-2 text-gray-500">No new notifications</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </ul>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-1 hover:bg-gray-300 rounded-md p-1"
          >
            <img
              src={profilePicture || "UserAssets/user.png"}
              alt={`${userDetails?.fullName}'s Profile`}
              className="rounded-full h-10 w-10"
            />
            <span className="hidden sm:block font-semibold text-sm">
              {userDetails?.fullName || "Guest"}
            </span>
            <IoIosArrowDown className="hidden sm:block" size={18} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-2 w-44 sm:w-56 bg-white border border-gray-300 rounded-md shadow-lg z-10 text-gray-700 text-sm">
              {/* <div className="absolute  text-center right-0 w-56 bg-gray-100 border border-gray-300 rounded shadow-lg text-gray-600 z-10"> */}
              <ul>
                <Link to="/profile">
                  <li className="p-2 hover:bg-gray-200 cursor-pointer">
                    My Profile
                  </li>
                </Link>
                <Link to="/Profile_Statistics">
                  <li className="p-2 hover:bg-gray-200 cursor-pointer">
                    My Statistics
                  </li>
                </Link>
                <li
                  className="p-2 hover:bg-gray-200 cursor-pointer"
                  onClick={handleLogout}
                >
                  Log out
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );

}

export default Navbar;
