const useAuth = () => {
  const token = localStorage.getItem('access_token');
  return {
    token: token,
    apiBaseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
  };
};

export { useAuth };