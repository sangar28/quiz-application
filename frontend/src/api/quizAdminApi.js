import apiClient from './apiClient';

export const formatApiError = (error, defaultMsg = 'An unexpected error occurred.') => {
  if (error.response) {
    const status = error.response.status;
    if (status === 401 || status === 403) {
      return 'You are not authorized.';
    }
    if (status === 404) {
      return error.response.data?.message || 'Requested resource was not found.';
    }
    if (error.response.data) {
      if (typeof error.response.data === 'string') {
        return error.response.data;
      }
      if (error.response.data.message) {
        return error.response.data.message;
      }
      if (error.response.data.errors && typeof error.response.data.errors === 'object') {
        return Object.values(error.response.data.errors).join(', ');
      }
    }
    return `Server returned error (${status})`;
  }
  if (error.request) {
    return 'Unable to connect to the server. Please try again.';
  }
  return error.message || defaultMsg;
};

// Quiz Operations
export const getAllQuizzes = async () => {
  const response = await apiClient.get('/api/admin/quizzes');
  return response.data;
};

export const createQuiz = async (quizData) => {
  const response = await apiClient.post('/api/admin/quizzes', quizData);
  return response.data;
};

export const updateQuiz = async (quizId, quizData) => {
  const response = await apiClient.put(`/api/admin/quizzes/${quizId}`, quizData);
  return response.data;
};

export const deleteQuiz = async (quizId) => {
  const response = await apiClient.delete(`/api/admin/quizzes/${quizId}`);
  return response.data;
};

// Question Operations
export const getQuizQuestions = async (quizId) => {
  const response = await apiClient.get(`/api/admin/quizzes/${quizId}/questions`);
  return response.data;
};

export const addQuestion = async (quizId, questionData) => {
  const response = await apiClient.post(`/api/admin/quizzes/${quizId}/questions`, questionData);
  return response.data;
};

export const deleteQuestion = async (questionId) => {
  const response = await apiClient.delete(`/api/admin/questions/${questionId}`);
  return response.data;
};

// Excel Upload
export const uploadQuestionsExcel = async (quizId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post(
    `/api/admin/quizzes/${quizId}/questions/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
