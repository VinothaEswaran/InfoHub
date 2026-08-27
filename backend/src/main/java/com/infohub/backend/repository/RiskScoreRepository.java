package com.infohub.backend.repository;

import com.infohub.backend.entity.RiskScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface RiskScoreRepository extends JpaRepository<RiskScore, Long> {
    List<RiskScore> findByUserIdAndRecordedAtAfterOrderByRecordedAtAsc(Long userId, LocalDateTime after);
    Optional<RiskScore> findTopByUserIdOrderByRecordedAtDesc(Long userId);
}
