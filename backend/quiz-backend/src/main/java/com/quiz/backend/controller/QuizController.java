package com.quiz.backend.controller;

import com.quiz.backend.dto.QuestionResponseDTO;
import com.quiz.backend.dto.QuizAttemptResponseDTO;
import com.quiz.backend.dto.QuizResponseDTO;
import com.quiz.backend.dto.StudentResultResponseDTO;
import com.quiz.backend.dto.SubmitQuizRequestDTO;
import com.quiz.backend.service.QuizAttemptService;
import com.quiz.backend.service.QuizService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;
    private final QuizAttemptService quizAttemptService;

    public QuizController(QuizService quizService, QuizAttemptService quizAttemptService) {
        this.quizService = quizService;
        this.quizAttemptService = quizAttemptService;
    }

    @GetMapping
    public ResponseEntity<List<QuizResponseDTO>> getActiveQuizzes() {
        return ResponseEntity.ok(quizService.getActiveQuizzes());
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<QuizResponseDTO> getQuizById(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizById(quizId));
    }

    @GetMapping("/{quizId}/questions")
    public ResponseEntity<List<QuestionResponseDTO>> getQuizQuestions(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizService.getQuizQuestions(quizId));
    }

    @PostMapping("/{quizId}/start")
    public ResponseEntity<QuizAttemptResponseDTO> startQuiz(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizAttemptService.startQuiz(quizId));
    }

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<QuizAttemptResponseDTO> getAttempt(@PathVariable Long attemptId) {
        return ResponseEntity.ok(quizAttemptService.getAttempt(attemptId));
    }

    @GetMapping("/attempts/{attemptId}/questions")
    public ResponseEntity<List<QuestionResponseDTO>> getAttemptQuestions(@PathVariable Long attemptId) {
        return ResponseEntity.ok(quizAttemptService.getAttemptQuestions(attemptId));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<StudentResultResponseDTO> submitQuiz(@PathVariable Long attemptId,
                                                               @Valid @RequestBody SubmitQuizRequestDTO request) {
        return ResponseEntity.ok(quizAttemptService.submitQuiz(attemptId, request));
    }

    @GetMapping("/attempts/{attemptId}/result")
    public ResponseEntity<StudentResultResponseDTO> getAttemptResult(@PathVariable Long attemptId) {
        return ResponseEntity.ok(quizAttemptService.getAttemptResult(attemptId));
    }
}
