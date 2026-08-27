package com.infohub.backend.repository;

import com.infohub.backend.entity.DeletionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DeletionRequestRepository extends JpaRepository<DeletionRequest, Long> {
    List<DeletionRequest> findByUserId(Long userId);
    List<DeletionRequest> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserIdAndStatusNotIn(Long userId, List<DeletionRequest.Status> statuses);
    List<DeletionRequest> findByStatusAndDeadlineBefore(DeletionRequest.Status status, LocalDate date);
    List<DeletionRequest> findByUserIdAndStatus(Long userId, DeletionRequest.Status status);
}
