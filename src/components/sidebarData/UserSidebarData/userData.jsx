import React from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';   
import EditNoteIcon from '@mui/icons-material/EditNote';  
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import TimelineIcon from '@mui/icons-material/Timeline';      // Shows trends over time
import AssignmentIcon from '@mui/icons-material/Assignment'; 
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'; // Shows daily/weekly frequency

const userSidebarData = [
    {
        title: "Home",
        icon: <DashboardIcon />,
        link: "/user/Home"
    },
    {
        title: "Anthro/profile",
        icon: <PeopleIcon />,
        link: "/user/UserProfile"
    },
    {
        title: "Diet Log",
        icon: <EditNoteIcon />,
        link: "/user/DietLog"
    },
    {
        title: "30-Day Diary",
        icon: <MenuBookIcon />,
        link: "/user/DiaryHistory"
    },
    {
        title: "Frequency",
        icon: <TimelineIcon />,
        link: "/user/Frequency"
    },
    {
        title: "Meal Plan",
        icon: <CalendarTodayIcon />,
        link: "/user/meal_Plan"
    },
    {
        title: "Plan",
        icon: <AssignmentIcon />,
        link: "/user/userPlan"
    },
     
    {
        title: "LogOut",
        icon: <LogoutIcon sx={{color:'white',fontSize:30}}/>,
        link: "/Logout"
    },
];

export default userSidebarData;