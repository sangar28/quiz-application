package com.quiz.backend.controller;

import com.quiz.backend.dto.*;
import com.quiz.backend.service.ExcelQuestionImportService;
import com.quiz.backend.service.QuizAdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/quizzes")
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuizController {

    private final QuizAdminService quizAdminService;
    private final ExcelQuestionImportService excelQuestionImportService;

    public AdminQuizController(QuizAdminService quizAdminService, ExcelQuestionImportService excelQuestionImportService) {
        this.quizAdminService = quizAdminService;
        this.excelQuestionImportService = excelQuestionImportService;
    }

    @PostMapping(value = "/{quizId}/questions/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ExcelUploadResponseDTO> uploadQuestions(
            @PathVariable Long quizId,
            @RequestParam("file") MultipartFile file) {
        ExcelUploadResponseDTO response = excelQuestionImportService.importQuestions(quizId, file);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AdminQuizResponseDTO> createQuiz(@Valid @RequestBody CreateQuizRequestDTO request) {
        AdminQuizResponseDTO response = quizAdminService.createQuiz(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AdminQuizResponseDTO>> getAllQuizzes() {
        return ResponseEntity.ok(quizAdminService.getAllQuizzes());
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<AdminQuizResponseDTO> updateQuiz(@PathVariable Long quizId,
                                                          @Valid @RequestBody UpdateQuizRequestDTO request) {
        return ResponseEntity.ok(quizAdminService.updateQuiz(quizId, request));
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId) {
        quizAdminService.deleteQuiz(quizId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{quizId}/questions")
    public ResponseEntity<AdminQuestionResponseDTO> addQuestion(@PathVariable Long quizId,
                                                               @Valid @RequestBody CreateQuestionRequestDTO request) {
        AdminQuestionResponseDTO response = quizAdminService.addQuestion(quizId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<PageResponseDTO<AdminQuestionResponseDTO>> getQuizQuestions(
            @PathVariable Long quizId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        int pageNum = Math.max(0, page);
        int pageSize = size > 0 ? size : 10;
        return ResponseEntity.ok(quizAdminService.getQuizQuestionsPaged(quizId, org.springframework.data.domain.PageRequest.of(pageNum, pageSize)));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        quizAdminService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}
