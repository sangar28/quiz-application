package com.quiz.backend.controller;

import com.quiz.backend.service.QuizAdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/questions")
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {

    private final QuizAdminService quizAdminService;

    public AdminQuestionController(QuizAdminService quizAdminService) {
        this.quizAdminService = quizAdminService;
    }

    @DeleteMapping("/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long questionId) {
        quizAdminService.deleteQuestion(questionId);
        return ResponseEntity.noContent().build();
    }
}
