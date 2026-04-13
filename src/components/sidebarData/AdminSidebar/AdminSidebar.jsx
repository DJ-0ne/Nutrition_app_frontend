import DashboardIcon from '@mui/icons-material/Dashboard';
import PaymentIcon from '@mui/icons-material/Payment';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';

const adminSidebar = [
  {
    title: "Dashboard",
    icon: <DashboardIcon className="h-5 w-5" />,
    link: "/admin/dashboard",
  },
  {
    title: "Payments",
    icon: <PaymentIcon className="h-5 w-5" />,
    link: "/admin/payments",
  },
  {
    title: "Notifications",
    icon: <NotificationsIcon className="h-5 w-5" />,
    link: "/admin/notifications",
    showBadge: true,
  },
  {
    title: "LogOut",
    icon: <LogoutIcon sx={{ color: 'red', fontSize: 30 }} />,
    link: "/Logout",
  },
];

export default adminSidebar;