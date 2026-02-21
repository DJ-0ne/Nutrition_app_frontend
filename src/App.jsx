import React from 'react'
import { AuthProvider } from "./components/Authentication/AuthContext";
import ProtectedRoute from "./components/Authentication/Protected";
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Authentication/Login';
import Landing from './components/LandingPage/Landing';
import Register from './components/Authentication/UserRegister';
import UserMain from './components/Accounts/UserAccount/UserMain';
import Logout from './components/Authentication/Logout';
import { LogOut } from 'lucide-react';
function App() {
    return(
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<Landing/>}/>
                    <Route path="/Login/" element={<Login/>}/>
                    <Route path="/Logout/" element={<Logout/>}/>
                    <Route path="/Register/" element={<Register/>}/>
                    {/* wrapping all portals with ProtectedRoute */}
                    <Route path="/user/*" element={
                            <ProtectedRoute allowedRoles={['user_client']}>
                                <UserMain/>
                            </ProtectedRoute>
                    }/>

                    <Route path="*" element={<Logout/>}/>
                </Routes>
            </AuthProvider>
        </Router>
    );
}
export default App;