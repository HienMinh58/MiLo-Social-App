const fallbackApiUrl = 'http://localhost:8080/api';

export const API_URL = (import.meta.env.VITE_API_URL || fallbackApiUrl).replace(/\/$/, '');
export const HUB_URL = API_URL.replace(/\/api$/, '') + '/hub/chat';
