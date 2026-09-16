package com.quiz.backend.dto;

public class AdminQuizResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private boolean active;
    private boolean showScore;
    private boolean showCorrectAnswers;

    public AdminQuizResponseDTO() {
    }

    public AdminQuizResponseDTO(Long id, String title, String description, Integer durationMinutes,
                                boolean active, boolean showScore, boolean showCorrectAnswers) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.active = active;
        this.showScore = showScore;
        this.showCorrectAnswers = showCorrectAnswers;
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
}
