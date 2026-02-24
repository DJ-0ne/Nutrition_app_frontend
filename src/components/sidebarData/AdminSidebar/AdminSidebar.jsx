// src/sidebarData/AdminSidebar/AdminSidebar.jsx
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PaymentIcon from '@mui/icons-material/Payment';
import LogoutIcon from '@mui/icons-material/Logout';

const adminSidebar = [
  {
    title: "Dashboard",
    icon: <DashboardIcon className="h-5 w-5" />,
    link: "/admin/dashboard"
  },

  {
    title: "Payments",
    icon: <PaymentIcon className="h-5 w-5" />,
    link: "/admin/payments"
  },
  {
    title: "LogOut",
    icon: <LogoutIcon sx={{ color: 'red', fontSize: 30 }} />,
    link: "/Logout"
  },
];

export default adminSidebar;