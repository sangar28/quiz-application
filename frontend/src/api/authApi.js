import apiClient from './apiClient';

export const getMe = async () => {
  const response = await apiClient.get('/api/auth/me');
  const data = response.data || {};
  const authorities = Array.isArray(data.authorities) ? data.authorities : [];

  const isAdmin = authorities.includes('ROLE_ADMIN');
  const role = isAdmin ? 'ADMIN' : 'STUDENT';

  return {
    name: data.name || '',
    email: data.email || '',
    role,
    authorities,
  };
};
