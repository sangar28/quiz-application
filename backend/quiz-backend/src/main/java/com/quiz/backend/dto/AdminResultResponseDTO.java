package com.quiz.backend.dto;

import java.time.LocalDateTime;

public class AdminResultResponseDTO {

    private Long resultId;
    private String studentName;
    private String rollNumber;
    private String studentEmail;
    private String quizTitle;
    private Integer score;
    private Integer totalQuestions;
    private Integer marks;
    private Integer totalMarks;
    private LocalDateTime submittedAt;
    private boolean retakeApproved;
    private Long attemptId;

    public AdminResultResponseDTO() {
    }

    public AdminResultResponseDTO(Long resultId, String studentName, String studentEmail,
                                  String quizTitle, Integer score, Integer totalQuestions,
                                  LocalDateTime submittedAt) {
        this(resultId, studentName, null, studentEmail, quizTitle, score, totalQuestions, submittedAt, false, null);
    }

    public AdminResultResponseDTO(Long resultId, String studentName, String studentEmail,
                                  String quizTitle, Integer score, Integer totalQuestions,
                                  LocalDateTime submittedAt, boolean retakeApproved) {
        this(resultId, studentName, null, studentEmail, quizTitle, score, totalQuestions, submittedAt, retakeApproved, null);
    }

    public AdminResultResponseDTO(Long resultId, String studentName, String studentEmail,
                                  String quizTitle, Integer score, Integer totalQuestions,
                                  LocalDateTime submittedAt, boolean retakeApproved, Long attemptId) {
        this(resultId, studentName, null, studentEmail, quizTitle, score, totalQuestions, submittedAt, retakeApproved, attemptId);
    }

    public AdminResultResponseDTO(Long resultId, String studentName, String rollNumber, String studentEmail,
                                  String quizTitle, Integer score, Integer totalQuestions,
                                  LocalDateTime submittedAt, boolean retakeApproved, Long attemptId) {
        this.resultId = resultId;
        this.studentName = studentName;
        this.rollNumber = rollNumber;
        this.studentEmail = studentEmail;
        this.quizTitle = quizTitle;
        this.score = score;
        this.totalQuestions = totalQuestions;
        this.marks = score;
        this.totalMarks = totalQuestions;
        this.submittedAt = submittedAt;
        this.retakeApproved = retakeApproved;
        this.attemptId = attemptId;
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

    public boolean isRetakeApproved() {
        return retakeApproved;
    }

    public void setRetakeApproved(boolean retakeApproved) {
        this.retakeApproved = retakeApproved;
    }

    public Long getAttemptId() {
        return attemptId;
    }

    public void setAttemptId(Long attemptId) {
        this.attemptId = attemptId;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public Integer getMarks() {
        return marks != null ? marks : score;
    }

    public void setMarks(Integer marks) {
        this.marks = marks;
    }

    public Integer getTotalMarks() {
        return totalMarks != null ? totalMarks : totalQuestions;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }
}
