package com.quiz.backend.service;

import com.quiz.backend.dto.*;

import java.util.List;

public interface QuizAdminService {

    AdminQuizResponseDTO createQuiz(CreateQuizRequestDTO request);

    List<AdminQuizResponseDTO> getAllQuizzes();

    AdminQuizResponseDTO updateQuiz(Long quizId, UpdateQuizRequestDTO request);

    void deleteQuiz(Long quizId);

    AdminQuestionResponseDTO addQuestion(Long quizId, CreateQuestionRequestDTO request);

    List<AdminQuestionResponseDTO> getQuizQuestions(Long quizId);

    void deleteQuestion(Long questionId);
}
