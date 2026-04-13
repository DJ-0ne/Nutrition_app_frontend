import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthContext } from "../../Authentication/AuthContext";
import { NotificationProvider } from "../../../context/NotificationsContext";

import AdminLayout from "../../Sidebar/AdminLayout";
import AdminDashboard from "../AdminAccount/AdminDashboard";
import AdminPayments from "../AdminAccount/AdminPayments";
import AdminNotifications from "../AdminAccount/AdminNotifications";
import Logout from "../../Authentication/Logout";

const AdminMain = () => {
  const { user, logout } = useAuthContext();

  return (
    <NotificationProvider>
      <AdminLayout user={user} logout={logout}>
        <Routes>
          <Route path="/"              element={<AdminDashboard />} />
          <Route path="/dashboard"     element={<AdminDashboard />} />
          <Route path="/payments"      element={<AdminPayments />} />
          <Route path="/notifications" element={<AdminNotifications />} />
          <Route path="*"              element={<Logout />} />
        </Routes>
      </AdminLayout>
    </NotificationProvider>
  );
};

export default AdminMain;