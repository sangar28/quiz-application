package com.quiz.backend.service;

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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceImplTest {

    @Mock
    private QuizRepository quizRepository;

    @Mock
    private QuestionRepository questionRepository;

    @Mock
    private QuizAttemptRepository quizAttemptRepository;

    @Mock
    private ResultRepository resultRepository;

    @Mock
    private SecurityUtils securityUtils;

    @InjectMocks
    private QuizServiceImpl quizService;

    private User studentUser;
    private Quiz activeQuiz;

    @BeforeEach
    void setUp() {
        studentUser = new User();
        studentUser.setId(1L);
        studentUser.setEmail("student@college.edu");
        studentUser.setName("Student One");

        activeQuiz = new Quiz();
        activeQuiz.setId(10L);
        activeQuiz.setTitle("Midterm Exam");
        activeQuiz.setActive(true);
        activeQuiz.setDurationMinutes(45);
    }

    @Test
    void testGetQuizById_ActiveAttemptTakesPrecedenceOverHistoricalResult() {
        when(quizRepository.findById(10L)).thenReturn(Optional.of(activeQuiz));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);

        QuizAttempt activeAttempt = new QuizAttempt(studentUser, activeQuiz, LocalDateTime.now().minusMinutes(5), LocalDateTime.now().plusMinutes(40));
        activeAttempt.setId(300L);
        when(quizAttemptRepository.findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(1L, 10L))
                .thenReturn(Optional.of(activeAttempt));

        Result historicalResult = new Result(studentUser, activeQuiz, 4, 10);
        historicalResult.setId(50L);
        historicalResult.setRetakeApproved(false);
        when(resultRepository.findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(1L, 10L))
                .thenReturn(Optional.of(historicalResult));

        QuizResponseDTO dto = quizService.getQuizById(10L);

        assertNotNull(dto);
        assertEquals(300L, dto.getActiveAttemptId());
        assertFalse(dto.isAlreadySubmitted(), "When an active attempt is in progress, alreadySubmitted must be FALSE");
    }

    @Test
    void testGetQuizById_SubmittedResultWithoutActiveAttempt_AlreadySubmittedIsTrue() {
        when(quizRepository.findById(10L)).thenReturn(Optional.of(activeQuiz));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);

        when(quizAttemptRepository.findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(1L, 10L))
                .thenReturn(Optional.empty());

        Result historicalResult = new Result(studentUser, activeQuiz, 4, 10);
        historicalResult.setId(50L);
        historicalResult.setRetakeApproved(true);
        when(resultRepository.findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(1L, 10L))
                .thenReturn(Optional.of(historicalResult));

        QuizResponseDTO dto = quizService.getQuizById(10L);

        assertNotNull(dto);
        assertNull(dto.getActiveAttemptId());
        assertTrue(dto.isAlreadySubmitted(), "When no active attempt exists and a result exists, alreadySubmitted must be TRUE");
        assertTrue(dto.isRetakeApproved());
    }

    @Test
    void testGetActiveQuizzes_ActiveAttemptTakesPrecedence() {
        when(quizRepository.findByActiveTrue()).thenReturn(List.of(activeQuiz));
        when(securityUtils.getCurrentUser()).thenReturn(studentUser);

        QuizAttempt activeAttempt = new QuizAttempt(studentUser, activeQuiz, LocalDateTime.now().minusMinutes(5), LocalDateTime.now().plusMinutes(40));
        activeAttempt.setId(300L);
        when(quizAttemptRepository.findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(1L, 10L))
                .thenReturn(Optional.of(activeAttempt));

        Result historicalResult = new Result(studentUser, activeQuiz, 4, 10);
        historicalResult.setId(50L);
        when(resultRepository.findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(1L, 10L))
                .thenReturn(Optional.of(historicalResult));

        List<QuizResponseDTO> list = quizService.getActiveQuizzes();

        assertEquals(1, list.size());
        assertEquals(300L, list.get(0).getActiveAttemptId());
        assertFalse(list.get(0).isAlreadySubmitted());
    }
}