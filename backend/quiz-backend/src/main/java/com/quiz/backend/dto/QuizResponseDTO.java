package com.quiz.backend.dto;

public class QuizResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private boolean showScore;
    private boolean showCorrectAnswers;
    private boolean allowCopy;
    private boolean allowPaste;
    private boolean allowRightClick;
    private boolean detectTabSwitch;
    private boolean autoSubmitOnViolation;
    private Integer violationThreshold;
    private boolean allowPreviousQuestion;
    private boolean randomQuestions;
    private boolean randomOptions;
    private boolean immediateResult;
    private boolean alreadySubmitted;
    private boolean retakeApproved;
    private Long activeAttemptId;

    public QuizResponseDTO() {
    }

    public QuizResponseDTO(Long id, String title, String description, Integer durationMinutes,
                           boolean showScore, boolean showCorrectAnswers, boolean allowCopy,
                           boolean allowPaste, boolean allowRightClick, boolean detectTabSwitch,
                           boolean autoSubmitOnViolation, Integer violationThreshold,
                           boolean allowPreviousQuestion, boolean randomQuestions,
                           boolean randomOptions, boolean immediateResult) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.showScore = showScore;
        this.showCorrectAnswers = showCorrectAnswers;
        this.allowCopy = allowCopy;
        this.allowPaste = allowPaste;
        this.allowRightClick = allowRightClick;
        this.detectTabSwitch = detectTabSwitch;
        this.autoSubmitOnViolation = autoSubmitOnViolation;
        this.violationThreshold = violationThreshold;
        this.allowPreviousQuestion = allowPreviousQuestion;
        this.randomQuestions = randomQuestions;
        this.randomOptions = randomOptions;
        this.immediateResult = immediateResult;
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

    public boolean isAlreadySubmitted() {
        return alreadySubmitted;
    }

    public void setAlreadySubmitted(boolean alreadySubmitted) {
        this.alreadySubmitted = alreadySubmitted;
    }

    public boolean isRetakeApproved() {
        return retakeApproved;
    }

    public void setRetakeApproved(boolean retakeApproved) {
        this.retakeApproved = retakeApproved;
    }

    public Long getActiveAttemptId() {
        return activeAttemptId;
    }

    public void setActiveAttemptId(Long activeAttemptId) {
        this.activeAttemptId = activeAttemptId;
    }
}