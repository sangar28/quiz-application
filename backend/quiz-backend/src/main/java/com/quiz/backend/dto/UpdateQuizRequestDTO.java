package com.quiz.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class UpdateQuizRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Duration in minutes is required")
    @Positive(message = "Duration in minutes must be positive")
    private Integer durationMinutes;

    private boolean showScore = true;

    private boolean showCorrectAnswers = false;

    private boolean active = false;

    public UpdateQuizRequestDTO() {
    }

    public UpdateQuizRequestDTO(String title, String description, Integer durationMinutes,
                                boolean showScore, boolean showCorrectAnswers, boolean active) {
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.showScore = showScore;
        this.showCorrectAnswers = showCorrectAnswers;
        this.active = active;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public boolean isShowScore() {
        return showScore;
    }

    public void setShowScore(boolean showScore) {
        this.showScore = showScore;
    }

    public boolean isShowCorrectAnswers() {
        return showCorrectAnswers;
    }

    public void setShowCorrectAnswers(boolean showCorrectAnswers) {
        this.showCorrectAnswers = showCorrectAnswers;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
