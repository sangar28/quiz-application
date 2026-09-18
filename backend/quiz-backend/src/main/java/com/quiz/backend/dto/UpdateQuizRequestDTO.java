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

    private boolean allowCopy = false;

    private boolean allowPaste = false;

    private boolean allowRightClick = false;

    private boolean detectTabSwitch = true;

    private boolean autoSubmitOnViolation = true;

    @Positive(message = "violationThreshold must be greater than 0")
    private Integer violationThreshold = 3;

    private boolean allowPreviousQuestion = true;

    private boolean randomQuestions = false;

    private boolean randomOptions = false;

    private boolean immediateResult = true;

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

    public boolean isAllowCopy() {
        return allowCopy;
    }

    public void setAllowCopy(boolean allowCopy) {
        this.allowCopy = allowCopy;
    }

    public boolean isAllowPaste() {
        return allowPaste;
    }

    public void setAllowPaste(boolean allowPaste) {
        this.allowPaste = allowPaste;
    }

    public boolean isAllowRightClick() {
        return allowRightClick;
    }

    public void setAllowRightClick(boolean allowRightClick) {
        this.allowRightClick = allowRightClick;
    }

    public boolean isDetectTabSwitch() {
        return detectTabSwitch;
    }

    public void setDetectTabSwitch(boolean detectTabSwitch) {
        this.detectTabSwitch = detectTabSwitch;
    }

    public boolean isAutoSubmitOnViolation() {
        return autoSubmitOnViolation;
    }

    public void setAutoSubmitOnViolation(boolean autoSubmitOnViolation) {
        this.autoSubmitOnViolation = autoSubmitOnViolation;
    }

    public Integer getViolationThreshold() {
        return violationThreshold;
    }

    public void setViolationThreshold(Integer violationThreshold) {
        this.violationThreshold = violationThreshold;
    }

    public boolean isAllowPreviousQuestion() {
        return allowPreviousQuestion;
    }

    public void setAllowPreviousQuestion(boolean allowPreviousQuestion) {
        this.allowPreviousQuestion = allowPreviousQuestion;
    }

    public boolean isRandomQuestions() {
        return randomQuestions;
    }

    public void setRandomQuestions(boolean randomQuestions) {
        this.randomQuestions = randomQuestions;
    }

    public boolean isRandomOptions() {
        return randomOptions;
    }

    public void setRandomOptions(boolean randomOptions) {
        this.randomOptions = randomOptions;
    }

    public boolean isImmediateResult() {
        return immediateResult;
    }

    public void setImmediateResult(boolean immediateResult) {
        this.immediateResult = immediateResult;
    }
}
