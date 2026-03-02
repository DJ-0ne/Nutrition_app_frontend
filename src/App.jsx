// App.jsx - ADDED CUSTOM INSTALL BUTTON FOR MANUAL PROMPT
import { useEffect, useState } from 'react'; // Added useState
import { AuthProvider } from "./components/Authentication/AuthContext";
import ProtectedRoute from "./components/Authentication/Protected";
import { HashRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./components/Authentication/Login";
import Landing from "./components/LandingPage/Landing";
import Register from "./components/Authentication/UserRegister";
import UserMain from "./components/Accounts/UserAccount/UserMain";
import Logout from "./components/Authentication/Logout";
import Recall from "./components/Accounts/UserAccount/Recall";
import AdminMain from "./components/Accounts/AdminAccount/AdminMain";
import GoogleCallback from "./components/Authentication/GoogleCallback";
import ForgotPassword from "./components/Authentication/ForgotPassword";
import ResetPassword from "./components/Authentication/ResetPassword";
import { Toaster } from "sonner";

function App() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Removed e.preventDefault(); still allowing potential auto-prompt, but capturing for manual
      setDeferredPrompt(e);
      setShowInstallButton(true); // Show button once event fires
      console.log('beforeinstallprompt event fired!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for install outcome (optional logging)
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed successfully!');
      setShowInstallButton(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => {});
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" richColors closeButton duration={4000} />
        {/* Custom Install Button - Place wherever it fits in your UI, e.g., in header or Landing */}
  
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login/" element={<Login />} />
          <Route path="/logout/" element={<Logout />} />
          <Route path="/register/" element={<Register />} />
          <Route path="/auth/google/callback" element={<GoogleCallback />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:uid/:token"
            element={<ResetPassword />}
          />

          {/* Specific route FIRST */}
          <Route
            path="/user/Recall"
            element={
              <ProtectedRoute allowedRoles={["user_client"]}>
                <Recall />
              </ProtectedRoute>
            }
          />

          {/* Catch-all for all /user/* */}
          <Route
            path="/user/*"
            element={
              <ProtectedRoute allowedRoles={["user_client"]}>
                <UserMain />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={["system_admin"]}>
                <AdminMain />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Logout />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;