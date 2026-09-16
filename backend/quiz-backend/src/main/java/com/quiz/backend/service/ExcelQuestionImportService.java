package com.quiz.backend.service;

import com.quiz.backend.dto.ExcelUploadResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface ExcelQuestionImportService {

    ExcelUploadResponseDTO importQuestions(Long quizId, MultipartFile file);
}
