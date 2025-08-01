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
  const [userDetails, setUserDetails] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();
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

      console.log('Token has expired or is invalid.');
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('LogIn');
    localStorage.removeItem('LogOut');
    localStorage.removeItem('User_Role');
    //localStorage.clear();
    //setProfilePicture(null);
    setUserDetails(null);
    navigate('/');
  };
  useAutoLogout(handleLogout);
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/About_Us" element={<AboutUs />} />
      <Route path="/UPCOMING EVENTS" element={<UpComingEvents />} />
      <Route path="/RESOURCES" element={<Resources />} />
      <Route path="/sign_up" element={<SignUp />} />
      <Route path="/Login" element={<SignIn setIsLoggedIn={setIsLoggedIn} setUserDetails={setUserDetails} />} />
      <Route path="/reset_password" element={<ForgotPassword />} />
      <Route path="/Verify Email" element={<VerifyEmail />} />

      {/* Common Route */}
      <Route
        path="/Dashboard"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER', 'ROLE_ADMIN']}>
            <Dashboard userDetails={userDetails} />
          </ProtectedRoute>
        }
      />

      {/* User Routes */}
      <Route path="/Teams" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><Teams userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Myteams" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><MyTeams userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Scoreboard" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><Scoreboard userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Instruction" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><Instruction userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/EventChallenges" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><EventChallenges userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/CreateTeam" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><CreateTeam userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Submissions" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><Submissions userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Profile" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><UserProfile /></ProtectedRoute>} />
      <Route path="/Profile_Statistics" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_USER']}><ProfileStats /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/Admin/Events" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminEvents userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/AssignChallenges" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AssignChallenges userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Activate-Events" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><ActivateEvents userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Instruction" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminInstruction userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Users" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><Users userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Registered_Users" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><RegisteredUsers userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Teams" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminTeams userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Challenges" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminChallenges userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/ChallengeCategory" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><ChallengeCategory userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Scoreboard" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminScoreBoard userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Submissions" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminSubmissions userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/MarkforReview" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminMarkForReview userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Organizations" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminOrganization userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/State&UT" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminState_UT userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Notifications" element={<ProtectedRoute isLoggedIn={isLoggedIn} allowedRoles={['ROLE_ADMIN']}><AdminNotification userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Profile" element={<ProtectedRoute isLoggedIn={isLoggedIn}><AdminProfile userDetails={userDetails} /></ProtectedRoute>} />
      <Route path="/Admin/Report" element={<ProtectedRoute isLoggedIn={isLoggedIn}><Report userDetails={userDetails} /></ProtectedRoute>} />


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
    return <Navigate to="/Dashboard" replace />;
  }

  return children;
};

export const NotFoundRoute = ({ isLoggedIn }) => {
  return <Navigate to={isLoggedIn ? "/Dashboard" : "/"} replace />;
};
