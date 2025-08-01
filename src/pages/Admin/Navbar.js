import { useState, useEffect, useRef, useContext } from 'react';
import { MdNotifications} from 'react-icons/md';
import { ImMenu } from 'react-icons/im';
import { useNavigate, Link } from 'react-router-dom';
import AuthService from '../Authentication/AuthService';
import { formatDistanceToNow, isToday, isThisWeek, parseISO, format } from 'date-fns';
import { RiDeleteBin6Line } from "react-icons/ri";
import { IoIosArrowDown } from "react-icons/io";
import { ProfileContext } from '../Context API/ProfileContext';
function Navbar({ value, setValue, setUserActivity }) {
    const [isOpen, setIsOpen] = useState(false);
    //const [profilePicture, setProfilePicture] = useState()
    const [isOpenNotification, setIsOpenNotification] = useState(false);
    const [notifications, setNotifications] = useState(() => {
        const savedNotifications = localStorage.getItem("notifications");
        return savedNotifications ? JSON.parse(savedNotifications) : [];
    });
    const navigate = useNavigate();
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
            console.error("Invalid notification time:", isoString);
            return "Invalid Date";
        }
        // Handle undefined/null/non-string values

        try {
            // Remove the unsupported `[Asia/Calcutta]` part safely
            const cleanIsoString = isoString.includes("[") ? isoString.split("[")[0] : isoString;

            // Parse the date
            const date = parseISO(cleanIsoString);

            if (isNaN(date.getTime())) return "Invalid Date"; // Handle invalid dates

            // If today, show "X minutes ago"
            if (isToday(date)) {
                return formatDistanceToNow(date, { addSuffix: true }); // e.g., "2 min ago"
            }

            // If within the same week, show "Monday", "Tuesday", etc.
            if (isThisWeek(date)) {
                return format(date, "EEEE"); // e.g., "Monday"
            }

            // Otherwise, return full date (e.g., "Feb 25, 2025")
            return format(date, "MMM d, yyyy");
        } catch (error) {
            console.error("Error formatting notification time:", error);
            return "Invalid Date";
        }
    };

    return (
  <div className="flex items-center justify-between w-full h-16 px-4 text-gray-700 bg-gray-100 font-Lexend_Bold">

    <div className="flex items-center">
      {!value && (
        <div className="flex items-center">
          <div
            className="p-2 rounded-lg cursor-pointer hover:bg-gray-300"
            onClick={() => setValue(!value)}
          >
            <ImMenu size={24} />
          </div>
          <img
            className="w-12 h-12 ml-2 rounded-full"
            src="/cdacLogo.png"
            alt="CDAC Logo"
            loading="lazy"
          />
          <div className="flex-col hidden ml-2 sm:flex">
            <p className="text-lg text-sky-700">CDAC</p>
            <span className="text-sm text-gray-700">Capture the Flag</span>
          </div>
        </div>
      )}
    </div>
    <div className="flex items-center space-x-2">
      <ul className="relative flex items-center space-x-2">
        <li
          className={`relative hover:bg-gray-300 h-10 w-10 rounded-lg flex items-center justify-center ${
            isOpenNotification ? "bg-gray-300" : ""
          }`}
          ref={dropdownRef}
          onClick={toggleDropdown}
        >
          <MdNotifications size={24} />
          {notifications.length > 0 && (
            <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-600 rounded-full -top-1 -right-1">
              {notifications.length}
            </span>
          )}
        </li>
        {isOpenNotification && (
          <div className="absolute right-0 z-20 p-2 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg top-14 w-72 sm:w-80 md:w-96 max-h-96">
            <h3 className="p-2 text-lg font-semibold text-gray-800 border-b">
              Notifications
            </h3>
            <ul className="overflow-auto max-h-80">
              {notifications.length > 0 ? (
                notifications
                  .map((notif) => ({
                    ...notif,
                    parsedTime: new Date(notif.notificationTime.split("[")[0]),
                  }))
                  .sort((a, b) => b.parsedTime - a.parsedTime)
                  .map((notif) => (
                    <li
                      key={notif.id}
                      className={`p-3 text-gray-700 font-Lexend_Regular border-b flex items-start justify-between last:border-none ${
                        notif.read ? "bg-white" : "bg-blue-50"
                      }`}
                    >
                      <div className="w-full pr-2">
                        <p className="text-sm">{notif.message}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          {formatNotificationTime(notif.notificationTime)}
                        </p>
                      </div>
                      <RiDeleteBin6Line
                        size={18}
                        className="text-red-500 cursor-pointer"
                        onClick={() => {
                          localStorage.removeItem(notif.id);
                        }}
                      />
                    </li>
                  ))
              ) : (
                <li className="p-2 text-gray-500">No new notifications</li>
              )}
            </ul>
          </div>
        )}
      </ul>

      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center p-1 space-x-1 rounded-md hover:bg-gray-300"
        >
          <img
            src={profilePicture || "/UserAssets/user.png"}
            alt={`${userDetails?.fullName}'s Profile`}
            className="w-10 h-10 rounded-full"
          />
          <span className="hidden text-sm font-semibold sm:block">
            {userDetails?.fullName || "Guest"}
          </span>
          <IoIosArrowDown className="hidden sm:block" size={18} />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-10 mt-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-lg w-44 sm:w-56">
            <ul>
              <Link to="/Admin/profile">
                <li className="p-2 cursor-pointer hover:bg-gray-200">
                  My Profile
                </li>
              </Link>
              <li
                className="p-2 cursor-pointer hover:bg-gray-200"
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
