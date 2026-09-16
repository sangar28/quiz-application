package com.quiz.backend.repository;

import com.quiz.backend.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByUserId(Long userId);

    List<Result> findByQuizId(Long quizId);
}
