import apiClient from './apiClient';

export const getAllResults = async () => {
  const response = await apiClient.get('/api/admin/results');
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
