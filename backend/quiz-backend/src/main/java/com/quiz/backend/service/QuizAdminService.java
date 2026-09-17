package com.quiz.backend.service;

import com.quiz.backend.dto.*;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface QuizAdminService {

    AdminQuizResponseDTO createQuiz(CreateQuizRequestDTO request);

    List<AdminQuizResponseDTO> getAllQuizzes();

    AdminQuizResponseDTO updateQuiz(Long quizId, UpdateQuizRequestDTO request);

    void deleteQuiz(Long quizId);

    AdminQuestionResponseDTO addQuestion(Long quizId, CreateQuestionRequestDTO request);

    List<AdminQuestionResponseDTO> getQuizQuestions(Long quizId);

    PageResponseDTO<AdminQuestionResponseDTO> getQuizQuestionsPaged(Long quizId, Pageable pageable);

    void deleteQuestion(Long questionId);
}
