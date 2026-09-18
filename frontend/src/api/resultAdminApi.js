import apiClient from './apiClient';

export const getAllResults = async (page = 0, size = 10) => {
  const response = await apiClient.get('/api/admin/results', {
    params: { page, size },
  });
  return response.data;
};

export const getAdminResults = async ({ quizId, search, page = 0, size = 10 } = {}) => {
  const params = { page, size };
  if (quizId && quizId !== 'all') {
    params.quizId = quizId;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }
  const response = await apiClient.get('/api/admin/results', { params });
  return response.data;
};

export const exportResultsExcel = async ({ quizId, search, columns } = {}) => {
  const params = {};
  if (quizId && quizId !== 'all') {
    params.quizId = quizId;
  }
  if (search && search.trim()) {
    params.search = search.trim();
  }
  if (columns && Array.isArray(columns) && columns.length > 0) {
    params.columns = columns.join(',');
  }
  const response = await apiClient.get('/api/admin/results/export', {
    params,
    responseType: 'blob',
  });
  return response.data;
};

export const getResultsByQuiz = async (quizId) => {
  const response = await apiClient.get(`/api/admin/results/quiz/${quizId}`);
  return response.data;
};

export const approveRetake = async (resultId) => {
  const response = await apiClient.post(`/api/admin/results/${resultId}/approve-retake`);
  return response.data;
};
