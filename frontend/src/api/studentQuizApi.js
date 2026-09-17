import apiClient from './apiClient';

export const formatApiError = (error, defaultMsg = 'An unexpected error occurred.') => {
  if (error.response) {
    const status = error.response.status;
    if (status === 401) {
      return 'You must be logged in to access this quiz.';
    }
    if (status === 403) {
      return 'You are not authorized to access this resource.';
    }
    if (status === 404) {
      return error.response.data?.message || 'The requested quiz or attempt was not found.';
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
    return 'Unable to connect to the server. Please check your connection and try again.';
  }
  return error.message || defaultMsg;
};

// Fetch active quizzes for students
export const getActiveQuizzes = async () => {
  const response = await apiClient.get('/api/quizzes');
  const data = response?.data;
  if (Array.isArray(data)) {
    return data;
  }
  if (data && Array.isArray(data.data)) {
    return data.data;
  }
  if (data && Array.isArray(data.quizzes)) {
    return data.quizzes;
  }
  return [];
};

// Fetch single quiz details for student
export const getQuizById = async (quizId) => {
  const response = await apiClient.get(`/api/quizzes/${quizId}`);
  return response.data;
};

// Start or resume a quiz attempt
export const startQuiz = async (quizId) => {
  const response = await apiClient.post(`/api/quizzes/${quizId}/start`);
  return response.data;
};

// Get single attempt details (validation, startedAt, expiresAt)
export const getAttempt = async (attemptId) => {
  const response = await apiClient.get(`/api/quizzes/attempts/${attemptId}`);
  return response.data;
};

// Get questions for an active attempt
export const getAttemptQuestions = async (attemptId) => {
  const response = await apiClient.get(`/api/quizzes/attempts/${attemptId}/questions`);
  return response.data;
};

// Submit student answers
export const submitQuiz = async (attemptId, answers) => {
  const response = await apiClient.post(`/api/quizzes/attempts/${attemptId}/submit`, {
    answers,
  });
  return response.data;
};

// Get the evaluated result for a submitted attempt
export const getAttemptResult = async (attemptId) => {
  const response = await apiClient.get(`/api/quizzes/attempts/${attemptId}/result`);
  return response.data;
};
