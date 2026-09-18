package com.quiz.backend.service;

import com.quiz.backend.dto.AdminResultResponseDTO;
import com.quiz.backend.dto.PageResponseDTO;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ResultService {

    List<AdminResultResponseDTO> getAllResults();

    List<AdminResultResponseDTO> getResultsByQuiz(Long quizId);

    PageResponseDTO<AdminResultResponseDTO> getFilteredResults(Long quizId, String search, Pageable pageable);

    byte[] exportResultsToExcel(Long quizId, String search);

    byte[] exportResultsToExcel(Long quizId, String search, List<String> columns);

    AdminResultResponseDTO approveRetake(Long resultId);
}
