package com.quiz.backend.dto;

import java.time.LocalDateTime;

public class AdminResultResponseDTO {

    private Long resultId;
    private String studentName;
    private String studentEmail;
    private String quizTitle;
    private Integer score;
    private Integer totalQuestions;
    private LocalDateTime submittedAt;

    public AdminResultResponseDTO() {
    }

    public AdminResultResponseDTO(Long resultId, String studentName, String studentEmail,
                                  String quizTitle, Integer score, Integer totalQuestions,
                                  LocalDateTime submittedAt) {
        this.resultId = resultId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.quizTitle = quizTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.submittedAt = submittedAt;
    }

    public Long getResultId() {
        return resultId;
    }

    public void setResultId(Long resultId) {
        this.resultId = resultId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getQuizTitle() {
        return quizTitle;
    }

    public void setQuizTitle(String quizTitle) {
        this.quizTitle = quizTitle;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}
