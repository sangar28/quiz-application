package com.quiz.backend.repository;

import com.quiz.backend.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    Optional<QuizAttempt> findById(Long id);

    Optional<QuizAttempt> findByUserIdAndQuizId(Long userId, Long quizId);

    Optional<QuizAttempt> findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(Long userId, Long quizId);
}
