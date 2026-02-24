import { AuthProvider } from "./components/Authentication/AuthContext";
import ProtectedRoute from "./components/Authentication/Protected";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './components/Authentication/Login';
import Landing from './components/LandingPage/Landing';
import Register from './components/Authentication/UserRegister';
import UserMain from './components/Accounts/UserAccount/UserMain';
import Logout from './components/Authentication/Logout';
import Recall from "./components/Accounts/UserAccount/Recall";

import AdminMain from './components/Accounts/AdminAccount/AdminMain';   // ← New import

import { Toaster } from 'sonner';

function App() {
    return (
        <Router>
            <AuthProvider>
                <Toaster 
                    position="top-center" 
                    richColors 
                    closeButton 
                    duration={4000}
                />
                
                <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/Login/" element={<Login />} />
                    <Route path="/Logout/" element={<Logout />} />
                    <Route path="/Register/" element={<Register />} />

                    {/* Protected User Routes */}
                    <Route 
                        path="/user/*" 
                        element={
                            <ProtectedRoute allowedRoles={['user_client']}>
                                <UserMain />
                            </ProtectedRoute>
                        } 
                    />
                    <Route 
                        path="/user/Recall" 
                        element={
                            <ProtectedRoute allowedRoles={['user_client']}>
                                <Recall />
                            </ProtectedRoute>
                        } 
                    />

                    {/* Protected Admin Routes - Superuser + system_admin now works */}
                    <Route 
                        path="/admin/*" 
                        element={
                            <ProtectedRoute allowedRoles={['system_admin']}>
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