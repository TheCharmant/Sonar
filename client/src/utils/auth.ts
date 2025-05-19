// Add this auth.ts utility file to help with authentication
export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const clearAuth = () => {
  localStorage.removeItem('token');
  // Redirect to login
  window.location.href = '/login';
};

// Add this function to parse JWT tokens (for debugging)
export const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};