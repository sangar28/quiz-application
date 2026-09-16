package com.quiz.backend.controller;

import com.quiz.backend.dto.AdminResultResponseDTO;
import com.quiz.backend.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/results")
@PreAuthorize("hasRole('ADMIN')")
public class AdminResultController {

    private final ResultService resultService;

    public AdminResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @GetMapping
    public ResponseEntity<List<AdminResultResponseDTO>> getAllResults() {
        return ResponseEntity.ok(resultService.getAllResults());
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<AdminResultResponseDTO>> getResultsByQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(resultService.getResultsByQuiz(quizId));
    }

    @PostMapping("/{resultId}/approve-retake")
    public ResponseEntity<AdminResultResponseDTO> approveRetake(@PathVariable Long resultId) {
        return ResponseEntity.ok(resultService.approveRetake(resultId));
    }
}
