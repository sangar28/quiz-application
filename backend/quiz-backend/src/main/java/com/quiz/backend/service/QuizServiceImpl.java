package com.quiz.backend.service;

import com.quiz.backend.dto.QuestionResponseDTO;
import com.quiz.backend.dto.QuizResponseDTO;
import com.quiz.backend.entity.Question;
import com.quiz.backend.entity.Quiz;
import com.quiz.backend.entity.QuizAttempt;
import com.quiz.backend.entity.Result;
import com.quiz.backend.entity.User;
import com.quiz.backend.repository.QuestionRepository;
import com.quiz.backend.repository.QuizAttemptRepository;
import com.quiz.backend.repository.QuizRepository;
import com.quiz.backend.repository.ResultRepository;
import com.quiz.backend.util.SecurityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class QuizServiceImpl implements QuizService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ResultRepository resultRepository;
    private final SecurityUtils securityUtils;

    public QuizServiceImpl(QuizRepository quizRepository,
                           QuestionRepository questionRepository,
                           QuizAttemptRepository quizAttemptRepository,
                           ResultRepository resultRepository,
                           SecurityUtils securityUtils) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.quizAttemptRepository = quizAttemptRepository;
        this.resultRepository = resultRepository;
        this.securityUtils = securityUtils;
    }

    @Override
    public List<QuizResponseDTO> getActiveQuizzes() {
        User currentUser = null;
        try {
            currentUser = securityUtils.getCurrentUser();
        } catch (Exception ignored) {
        }

        final User user = currentUser;

        return quizRepository.findByActiveTrue()
                .stream()
                .map(quiz -> {
                    QuizResponseDTO dto = new QuizResponseDTO(
                            quiz.getId(),
                            quiz.getTitle(),
                            quiz.getDescription(),
                            quiz.getDurationMinutes(),
                            quiz.isShowScore(),
                            quiz.isShowCorrectAnswers(),
                            quiz.isAllowCopy(),
                            quiz.isAllowPaste(),
                            quiz.isAllowRightClick(),
                            quiz.isDetectTabSwitch(),
                            quiz.isAutoSubmitOnViolation(),
                            quiz.getViolationThreshold(),
                            quiz.isAllowPreviousQuestion(),
                            quiz.isRandomQuestions(),
                            quiz.isRandomOptions(),
                            quiz.isImmediateResult()
                    );

                    if (user != null) {
                        Optional<QuizAttempt> unfinishedAttempt = quizAttemptRepository
                                .findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(user.getId(), quiz.getId());
                        if (unfinishedAttempt.isPresent() && LocalDateTime.now().isBefore(unfinishedAttempt.get().getExpiresAt())) {
                            dto.setActiveAttemptId(unfinishedAttempt.get().getId());
                        }

                        Optional<Result> latestResultOpt = resultRepository
                                .findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(user.getId(), quiz.getId());
                        if (latestResultOpt.isPresent()) {
                            Result latestResult = latestResultOpt.get();
                            dto.setAlreadySubmitted(true);
                            dto.setRetakeApproved(latestResult.isRetakeApproved());
                        }
                    }

                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<QuestionResponseDTO> getQuizQuestions(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId));

        List<Question> questions = new ArrayList<>(questionRepository.findByQuizId(quizId));
        if (quiz.isRandomQuestions()) {
            Collections.shuffle(questions);
        }

        return questions.stream()
                .map(q -> new QuestionResponseDTO(
                        q.getId(),
                        q.getQuestionText(),
                        q.getOptionA(),
                        q.getOptionB(),
                        q.getOptionC(),
                        q.getOptionD()
                ))
                .collect(Collectors.toList());
    }
}
