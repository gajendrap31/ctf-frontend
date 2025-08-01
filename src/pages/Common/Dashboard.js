
import AdminDashboard from '../Admin/AdminDashboard';

import UserDashboard from '../User/UserDashboard'


const Dashboard = ({ userDetails }) => {

  if (!userDetails) {
    return <div>Loading...</div>;
  }
  const userRole=localStorage.getItem('User_Role')

  return (
    <div>
      {userRole === 'ROLE_ADMIN' && <AdminDashboard userDetails={userDetails} />}
      {userRole === 'ROLE_USER' && <UserDashboard userDetails={userDetails}/>}
    </div>
  );
};

export default Dashboard;