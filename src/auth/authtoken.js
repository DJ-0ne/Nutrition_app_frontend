const useAuth = () => {
  const token = localStorage.getItem('access_token');
  return {
    token: token,
    apiBaseURL: import.meta.env.VITE_API_URL || process.env.VITE_API_URL
  };
};

export { useAuth };