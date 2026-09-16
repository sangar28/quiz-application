package com.quiz.backend.repository;

import com.quiz.backend.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByUserId(Long userId);

    List<Result> findByQuizId(Long quizId);

    Optional<Result> findByUserIdAndQuizId(Long userId, Long quizId);

    Optional<Result> findTopByUserIdAndQuizIdOrderBySubmittedAtDesc(Long userId, Long quizId);

    Optional<Result> findByAttemptId(Long attemptId);
}
