import { useState } from 'react';
import useAutoLogout from '../useAutoLogout';
import LogoutModal from '../LogoutModal';

import AdminDashboard from '../Admin/AdminDashboard';
import UserDashboard from '../User/UserDashboard';

const Dashboard = ({ userDetails }) => {
  const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);

  const handleLogout = () => {
    localStorage.clear(); // or any logout logic
    window.location.href = '/login';
  };

  const showLogoutModal = () => setLogoutModalOpen(true);

  useAutoLogout(showLogoutModal, 29 * 60 * 1000); // e.g., 30 min for testing

  if (!userDetails) return <div>Loading...</div>;

  const userRole = localStorage.getItem('User_Role');

  return (
    <div>
      {userRole === 'ROLE_ADMIN' && <AdminDashboard userDetails={userDetails} />}
      {userRole === 'ROLE_USER' && <UserDashboard userDetails={userDetails} />}

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onConfirm={handleLogout}
        onCancel={() => setLogoutModalOpen(false)}
      />
    </div>
  );
};

export default Dashboard;
