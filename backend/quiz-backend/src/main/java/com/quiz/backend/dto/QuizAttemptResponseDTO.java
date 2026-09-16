package com.quiz.backend.dto;

import java.time.LocalDateTime;

public class QuizAttemptResponseDTO {

    private Long attemptId;
    private Long quizId;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;

    public QuizAttemptResponseDTO() {
    }

    public QuizAttemptResponseDTO(Long attemptId, Long quizId, LocalDateTime startedAt, LocalDateTime expiresAt) {
        this.attemptId = attemptId;
        this.quizId = quizId;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public Long getQuizId() {
        return quizId;
    }

    public void setQuizId(Long quizId) {
        this.quizId = quizId;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }
}
