package com.quiz.backend.service;

import com.quiz.backend.dto.AdminResultResponseDTO;

import java.util.List;

public interface ResultService {

    List<AdminResultResponseDTO> getAllResults();

    List<AdminResultResponseDTO> getResultsByQuiz(Long quizId);
}
