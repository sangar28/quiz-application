package com.quiz.backend.service;

import com.quiz.backend.dto.QuestionResponseDTO;
import com.quiz.backend.dto.QuizResponseDTO;

import java.util.List;

public interface QuizService {

    List<QuizResponseDTO> getActiveQuizzes();

    List<QuestionResponseDTO> getQuizQuestions(Long quizId);
}