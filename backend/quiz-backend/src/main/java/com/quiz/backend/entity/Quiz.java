package com.quiz.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    private boolean active = false;

    private boolean showScore = true;

    private boolean showCorrectAnswers = false;

    private Integer durationMinutes;

    private boolean allowCopy = false;

    private boolean allowPaste = false;

    private boolean allowRightClick = false;

    private boolean detectTabSwitch = true;

    private boolean autoSubmitOnViolation = true;

    private Integer violationThreshold = 3;

    private boolean allowPreviousQuestion = true;

    private boolean randomQuestions = false;

    private boolean randomOptions = false;

    private boolean immediateResult = true;

    public Quiz() {
    }

    public Quiz(String title, String description, Integer durationMinutes) {
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.active = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
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