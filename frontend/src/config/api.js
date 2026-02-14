// Get the API URL based on the environment
export const getApiUrl = () => {
  // In Docker: use the backend service name
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    // Local development
    return 'http://localhost:8080/api';
  }
  
  // Docker container (frontend container)
  // Use the backend service name from docker-compose
  return 'http://backend:8080/api';
};

export const API_URL = getApiUrl();
