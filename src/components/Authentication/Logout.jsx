import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from './AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const Logout = () => {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  useEffect(() => {
    const handleLogout = async () => {
      await logout();
      navigate('/Login', { replace: true });
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <Box 
      display="flex" 
      flexDirection="column"
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
      bgcolor="#f5f5f5"
    >
      <CircularProgress sx={{ color: '#d35400', mb: 2 }} />
      <Typography variant="h6" color="textSecondary">
        Logging out...
      </Typography>
    </Box>
  );
};

export default Logout;