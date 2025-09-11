import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuthService from './pages/Authentication/AuthService';
import useAutoLogout from './pages/useAutoLogout';
// Public Pages
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import AboutUs from './pages/AboutUs';
import UpComingEvents from './pages/UpComingEvents';
import Resources from './pages/Resources';

// Common
import Dashboard from './pages/Common/Dashboard';
import { useContext } from 'react';
import { ProfileContext } from './pages/Context API/ProfileContext';

// User Pages
import Teams from './pages/User/Teams';
import MyTeams from './pages/User/MyTeams';
import Scoreboard from './pages/User/ScoreBoard';
import Instruction from './pages/User/Instruction';
import EventChallenges from './pages/User/EventChallenges';
import CreateTeam from './pages/User/CreateTeam';
import Submissions from './pages/User/Submissions';
import UserProfile from './pages/User/Profile';
import ProfileStats from './pages/User/ProfileStats';

// Admin Pages
import AdminEvents from './pages/Admin/AdminPanel/Events';
import AssignChallenges from './pages/Admin/AdminPanel/AssignChallenges/AssignChallenges';
import ActivateEvents from './pages/Admin/AdminPanel/ActivateEvents';
import AdminInstruction from './pages/Admin/AdminPanel/Instruction';
import Users from './pages/Admin/AdminPanel/Users';
import RegisteredUsers from './pages/Admin/AdminPanel/RegisteredUsers';
import AdminTeams from './pages/Admin/AdminPanel/Teams';
import AdminChallenges from './pages/Admin/AdminPanel/Challenges';
import ChallengeCategory from './pages/Admin/AdminPanel/ChallengeCategory';
import AdminScoreBoard from './pages/Admin/AdminPanel/Scoreboard';
import AdminSubmissions from './pages/Admin/AdminPanel/Submissions';
import AdminMarkForReview from './pages/Admin/AdminPanel/MarkForReview';
import AdminOrganization from './pages/Admin/AdminPanel/Organization';
import AdminNotification from './pages/Admin/AdminPanel/Notification';
import AdminProfile from './pages/Admin/AdminPanel/AdminProfile';
import AdminState_UT from './pages/Admin/AdminPanel/State&UT';
import Report from './pages/Admin/AdminPanel/Reports';
function App() {
  const { setProfilePicture } = useContext(ProfileContext);
  const [userDetails, setUserDetails] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem("notifications");
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });

  useEffect(() => {
    const token = AuthService.getToken();
    if (AuthService.isTokenValid(token)) {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.role;

      setUserDetails(decodedToken);
      setIsLoggedIn(true);

      localStorage.setItem('User_Role', userRole);
      localStorage.setItem('LogIn', true);
      localStorage.setItem('LogOut', false);
    } else {
      setIsLoggedIn(false);

      localStorage.removeItem('Token');
      localStorage.removeItem('User_Role');
      localStorage.removeItem('LogIn');
      localStorage.removeItem('LogOut');
    }
  }, []);

  const handleLogout = async () => {
    await AuthService.logout({
      setUserDetails,
      setNotifications,
      setProfilePicture,
      navigate,
    });
  };

  useAutoLogout(handleLogout);
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about-us" element={<AboutUs />} />
      <Route path="/upcoming-events" element={<UpComingEvents />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/login" element={<SignIn setIsLoggedIn={setIsLoggedIn} setUserDetails={setUserDetails} />} />
      <Route path="/reset-password" element={<ForgotPassword />} />
      <Route path="/verify-email" element={<VerifyEmail />} />

      {/* Common Route */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
            <Dashboard userDetails={userDetails} />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route path="/teams" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><Teams userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/my-team" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><MyTeams userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/scoreboard" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><Scoreboard userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/instruction" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><Instruction userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/event-challenges" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><EventChallenges userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/create-team" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><CreateTeam userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/submissions" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><Submissions userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><UserProfile /></ProtectedRoute>} />
      <Route path="/profile-statistics" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><ProfileStats /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin/events" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminEvents userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/assign-challenges" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AssignChallenges userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/activate-events" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><ActivateEvents userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/instruction" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminInstruction userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><Users userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/registered-users" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><RegisteredUsers userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/teams" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminTeams userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/challenges" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminChallenges userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/challenge-category" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><ChallengeCategory userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/scoreboard" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminScoreBoard userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/submissions" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminSubmissions userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/mark-for-review" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminMarkForReview userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/organisations" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminOrganization userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/state-ut" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminState_UT userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/notifications" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminNotification userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/profile" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AdminProfile userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/admin/report" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Report userDetails={userDetails} /></ProtectedRoute>} />


      {/* Fallback Route */}
      <Route path="*" element={<NotFoundRoute isLoggedIn={isLoggedIn} />} />
    </Routes>
  );
}

export default App;

export const ProtectedRoute = ({ isLoggedIn, allowedRoles = [], children }) => {
  const userRole = localStorage.getItem('User_Role');

  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const NotFoundRoute = ({ isLoggedIn }) => {
  return <Navigate to={isLoggedIn ? "/dashboard" : "/"} replace />;
};
