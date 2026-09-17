package com.quiz.backend.repository;

import com.quiz.backend.entity.QuizAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {

    Optional<QuizAttempt> findById(Long id);

    Optional<QuizAttempt> findByUserIdAndQuizId(Long userId, Long quizId);

    Optional<QuizAttempt> findFirstByUserIdAndQuizIdAndSubmittedFalseOrderByStartedAtDesc(Long userId, Long quizId);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM QuizAttempt qa WHERE qa.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") Long quizId);
}
