package com.quiz.backend.service;

import com.quiz.backend.dto.QuestionResponseDTO;
import com.quiz.backend.dto.QuizAttemptResponseDTO;
import com.quiz.backend.dto.StudentResultResponseDTO;
import com.quiz.backend.dto.SubmitQuizRequestDTO;
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
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuizAttemptServiceImpl implements QuizAttemptService {

    private final QuizAttemptRepository quizAttemptRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final ResultRepository resultRepository;
    private final SecurityUtils securityUtils;

    public QuizAttemptServiceImpl(QuizAttemptRepository quizAttemptRepository,
                                  QuizRepository quizRepository,
                                  QuestionRepository questionRepository,
                                  ResultRepository resultRepository,
                                  SecurityUtils securityUtils) {
        this.quizAttemptRepository = quizAttemptRepository;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.resultRepository = resultRepository;
        this.securityUtils = securityUtils;
    }

    @Override
    public QuizAttemptResponseDTO startQuiz(Long quizId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz not found with id: " + quizId));

        if (!quiz.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz is not active");
        }

        User user = securityUtils.getCurrentUser();

        Optional<QuizAttempt> unfinishedAttempt = quizAttemptRepository
                .findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(user.getId(), quizId);

        if (unfinishedAttempt.isPresent()) {
            QuizAttempt attempt = unfinishedAttempt.get();
            if (LocalDateTime.now().isBefore(attempt.getExpiresAt())) {
                long remainingSeconds = Math.max(0, java.time.Duration.between(LocalDateTime.now(), attempt.getExpiresAt()).getSeconds());
                return new QuizAttemptResponseDTO(
                        attempt.getId(),
                        quizId,
                        attempt.getStartedAt(),
                        attempt.getExpiresAt(),
                        remainingSeconds,
                        attempt.isSubmitted()
                );
            }
        }

        // Check if student has already submitted a result for this quiz
        Optional<Result> latestResultOpt = resultRepository
                .findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(user.getId(), quizId);

        if (latestResultOpt.isPresent()) {
            Result latestResult = latestResultOpt.get();
            if (!latestResult.isRetakeApproved()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz has already been submitted. A retake requires admin approval.");
            }
            // Consume the approved retake so it cannot be repeatedly reused
            latestResult.setRetakeApproved(false);
            resultRepository.save(latestResult);
        }

        LocalDateTime startedAt = LocalDateTime.now();
        int duration = quiz.getDurationMinutes() != null ? quiz.getDurationMinutes() : 0;
        LocalDateTime expiresAt = startedAt.plusMinutes(duration);

        QuizAttempt newAttempt = new QuizAttempt(user, quiz, startedAt, expiresAt);
        newAttempt = quizAttemptRepository.save(newAttempt);

        long remainingSeconds = Math.max(0, java.time.Duration.between(LocalDateTime.now(), expiresAt).getSeconds());
        return new QuizAttemptResponseDTO(
                newAttempt.getId(),
                quizId,
                newAttempt.getStartedAt(),
                newAttempt.getExpiresAt(),
                remainingSeconds,
                newAttempt.isSubmitted()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public QuizAttemptResponseDTO getAttempt(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz attempt not found with id: " + attemptId));

        User user = securityUtils.getCurrentUser();
        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to quiz attempt");
        }

        if (attempt.isSubmitted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz attempt has already been submitted");
        }

        if (LocalDateTime.now().isAfter(attempt.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz attempt has expired");
        }

        Quiz quiz = attempt.getQuiz();
        if (quiz == null || !quiz.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz is not active");
        }

        long attemptRemainingSeconds = Math.max(0, java.time.Duration.between(LocalDateTime.now(), attempt.getExpiresAt()).getSeconds());
        return new QuizAttemptResponseDTO(
                attempt.getId(),
                quiz.getId(),
                attempt.getStartedAt(),
                attempt.getExpiresAt(),
                attemptRemainingSeconds,
                attempt.isSubmitted()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponseDTO> getAttemptQuestions(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz attempt not found with id: " + attemptId));

        User user = securityUtils.getCurrentUser();
        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to quiz attempt");
        }

        if (attempt.isSubmitted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz attempt has already been submitted");
        }

        if (LocalDateTime.now().isAfter(attempt.getExpiresAt())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz attempt has expired");
        }

        Quiz quiz = attempt.getQuiz();
        if (quiz == null || !quiz.isActive()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz is not active");
        }

        List<Question> questions = new ArrayList<>(questionRepository.findByQuizId(quiz.getId()));
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

    @Override
    public StudentResultResponseDTO submitQuiz(Long attemptId, SubmitQuizRequestDTO request) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz attempt not found with id: " + attemptId));

        User user = securityUtils.getCurrentUser();
        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to quiz attempt");
        }

        if (attempt.isSubmitted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz attempt has already been submitted");
        }

        if (request == null || request.getAnswers() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Answers map is required");
        }

        List<Question> questions = questionRepository.findByQuizId(attempt.getQuiz().getId());
        Map<Long, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        for (Map.Entry<String, String> entry : request.getAnswers().entrySet()) {
            if (entry.getKey() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question ID must not be null");
            }
            Long qId;
            try {
                qId = Long.parseLong(entry.getKey());
            } catch (NumberFormatException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid question ID format: " + entry.getKey());
            }
            if (!questionMap.containsKey(qId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Question ID " + qId + " does not belong to this quiz");
            }
            String option = entry.getValue();
            if (option == null || !option.trim().matches("(?i)^[ABCD]$")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid option value: " + option + " for question ID: " + qId);
            }
        }

        int score = 0;
        for (Question q : questions) {
            String submittedOption = request.getAnswers().get(String.valueOf(q.getId()));
            if (submittedOption != null && q.getCorrectOption() != null) {
                if (submittedOption.trim().equalsIgnoreCase(q.getCorrectOption().trim())) {
                    score++;
                }
            }
        }

        Result result = new Result(user, attempt.getQuiz(), score, questions.size());
        result.setAttemptId(attemptId);
        result.setRetakeApproved(false);
        result = resultRepository.save(result);

        attempt.setSubmitted(true);
        quizAttemptRepository.save(attempt);

        Integer displayScore = attempt.getQuiz().isShowScore() ? score : null;

        return new StudentResultResponseDTO(
                result.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                displayScore,
                questions.size(),
                result.getSubmittedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResultResponseDTO getAttemptResult(Long attemptId) {
        QuizAttempt attempt = quizAttemptRepository.findById(attemptId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quiz attempt not found with id: " + attemptId));

        User user = securityUtils.getCurrentUser();
        if (!attempt.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to quiz attempt result");
        }

        if (!attempt.isSubmitted()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quiz attempt has not been submitted yet");
        }

        Result result = resultRepository.findByAttemptId(attemptId)
                .orElseGet(() -> resultRepository
                        .findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(user.getId(), attempt.getQuiz().getId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Result not found for attempt")));

        Integer displayScore = attempt.getQuiz().isShowScore() ? result.getScore() : null;

        return new StudentResultResponseDTO(
                result.getId(),
                attempt.getQuiz().getId(),
                attempt.getQuiz().getTitle(),
                displayScore,
                result.getTotalQuestions(),
                result.getSubmittedAt()
        );
    }
}
