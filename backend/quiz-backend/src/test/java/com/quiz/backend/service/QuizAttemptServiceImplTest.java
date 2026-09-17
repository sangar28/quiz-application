package com.quiz.backend.service;

import com.quiz.backend.dto.QuizAttemptResponseDTO;
import com.quiz.backend.dto.QuizResponseDTO;
import com.quiz.backend.entity.Quiz;
import com.quiz.backend.entity.QuizAttempt;
import com.quiz.backend.entity.Result;
import com.quiz.backend.entity.User;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.repository.QuizAttemptRepository;
import com.quiz.backend.repository.QuizRepository;
import com.quiz.backend.repository.ResultRepository;
import com.quiz.backend.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizAttemptServiceImplTest {

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private QuizAttemptServiceImpl quizAttemptService;

    private User studentUser;
    private User otherUser;
    private Quiz activeQuiz;
    private QuizAttempt validAttempt;

    @BeforeEach
    void setUp() {
        studentUser = new User();
        studentUser.setId(1L);
        studentUser.setEmail("student@college.edu");
        studentUser.setName("Student One");

        otherUser = new User();
        otherUser.setId(2L);
        otherUser.setEmail("other@college.edu");

        activeQuiz = new Quiz();
        activeQuiz.setId(10L);
        activeQuiz.setTitle("Midterm Assessment");
        activeQuiz.setActive(true);
        activeQuiz.setDurationMinutes(30);

        validAttempt = new QuizAttempt(
                studentUser,
                activeQuiz,
                LocalDateTime.now().minusMinutes(5),
                LocalDateTime.now().plusMinutes(25)
        );
        validAttempt.setId(100L);
    }

    @Test
    void testGetAttempt_Success() {
        when(quizAttemptRepository.findById(100L)).thenReturn(Optional.of(validAttempt));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);

        QuizAttemptResponseDTO dto = quizAttemptService.getAttempt(100L);

        assertNotNull(dto);
        assertEquals(100L, dto.getAttemptId());
        assertEquals(10L, dto.getQuizId());
        assertEquals(validAttempt.getExpiresAt(), dto.getExpiresAt());
    }

    @Test
    void testGetAttempt_NotFound() {
        when(quizAttemptRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> quizAttemptService.getAttempt(999L));
    }

    @Test
    void testGetAttempt_ForbiddenForAnotherUser() {
        when(quizAttemptRepository.findById(100L)).thenReturn(Optional.of(validAttempt));
        when(securityUtils.getCurrentUser()).thenReturn(otherUser);

        assertThrows(ResponseStatusException.class, () -> quizAttemptService.getAttempt(100L));
    }

    @Test
    void testGetAttempt_AlreadySubmitted() {
        validAttempt.setSubmitted(true);
        when(quizAttemptRepository.findById(100L)).thenReturn(Optional.of(validAttempt));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> quizAttemptService.getAttempt(100L));
        assertTrue(ex.getReason().contains("already been submitted"));
    }

    @Test
    void testGetAttempt_Expired() {
        validAttempt.setExpiresAt(LocalDateTime.now().minusMinutes(1));
        when(quizAttemptRepository.findById(100L)).thenReturn(Optional.of(validAttempt));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> quizAttemptService.getAttempt(100L));
        assertTrue(ex.getReason().contains("expired"));
    }

    @Test
    void testStartQuiz_ResumesExistingUnsubmittedAttempt() {
        when(quizRepository.findById(10L)).thenReturn(Optional.of(activeQuiz));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);
        when(quizAttemptRepository.findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(1L, 10L))
                .thenReturn(Optional.of(validAttempt));

        QuizAttemptResponseDTO dto = quizAttemptService.startQuiz(10L);

        assertNotNull(dto);
        assertEquals(100L, dto.getAttemptId());
        verify(quizAttemptRepository, never()).save(any());
    }

    @Test
    void testStartQuiz_RetakeApproved_CreatesNewAttemptAndConsumesApproval() {
        when(quizRepository.findById(10L)).thenReturn(Optional.of(activeQuiz));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);
        when(quizAttemptRepository.findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(1L, 10L))
                .thenReturn(Optional.empty());

        Result oldResult = new Result(studentUser, activeQuiz, 5, 10);
        oldResult.setId(50L);
        oldResult.setRetakeApproved(true);
        when(resultRepository.findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(1L, 10L))
                .thenReturn(Optional.of(oldResult));

        QuizAttempt newAttempt = new QuizAttempt(studentUser, activeQuiz, LocalDateTime.now(), LocalDateTime.now().plusMinutes(30));
        newAttempt.setId(200L);
        when(quizAttemptRepository.save(any(QuizAttempt.class))).thenReturn(newAttempt);

        QuizAttemptResponseDTO dto = quizAttemptService.startQuiz(10L);

        assertNotNull(dto);
        assertEquals(200L, dto.getAttemptId());
        assertFalse(oldResult.isRetakeApproved(), "Retake approval must be consumed");
        verify(resultRepository, times(1)).save(oldResult);
        verify(quizAttemptRepository, times(1)).save(any(QuizAttempt.class));
    }

    @Test
    void testStartQuiz_WithoutRetakeApproval_Rejects() {
        when(quizRepository.findById(10L)).thenReturn(Optional.of(activeQuiz));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);
        when(quizAttemptRepository.findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(1L, 10L))
                .thenReturn(Optional.empty());

        Result oldResult = new Result(studentUser, activeQuiz, 5, 10);
        oldResult.setId(50L);
        oldResult.setRetakeApproved(false);
        when(resultRepository.findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(1L, 10L))
                .thenReturn(Optional.of(oldResult));

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> quizAttemptService.startQuiz(10L));
        assertTrue(ex.getReason().contains("already been submitted"));
    }
}