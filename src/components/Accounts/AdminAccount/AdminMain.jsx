// src/components/admin/AdminMain.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthContext } from "../../Authentication/AuthContext";   // adjust path if needed

import AdminLayout from "../../Sidebar/AdminLayout";
import AdminDashboard from "../AdminAccount/AdminDashboard";
import AdminPayments from "../AdminAccount/AdminPayments";
import Logout from "../../Authentication/Logout";

const AdminMain = () => {
  const { user, logout } = useAuthContext();

  return (
    <AdminLayout user={user} logout={logout}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/payments" element={<AdminPayments />} />
        
        {/* Catch-all */}
        <Route path="*" element={<Logout />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminMain;