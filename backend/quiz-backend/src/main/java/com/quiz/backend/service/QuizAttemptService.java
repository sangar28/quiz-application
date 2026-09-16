package com.quiz.backend.service;

import com.quiz.backend.dto.QuestionResponseDTO;
import com.quiz.backend.dto.QuizAttemptResponseDTO;
import com.quiz.backend.dto.StudentResultResponseDTO;
import com.quiz.backend.dto.SubmitQuizRequestDTO;

import java.util.List;

public interface QuizAttemptService {

    QuizAttemptResponseDTO startQuiz(Long quizId);

    List<QuestionResponseDTO> getAttemptQuestions(Long attemptId);

    StudentResultResponseDTO submitQuiz(Long attemptId, SubmitQuizRequestDTO request);

    StudentResultResponseDTO getAttemptResult(Long attemptId);
}
