package com.infohub.backend.repository;

import com.infohub.backend.entity.Breach;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BreachRepository extends JpaRepository<Breach, Long> {
    List<Breach> findByUserId(Long userId);
    List<Breach> findByUserIdOrderByDetectedAtDesc(Long userId);
    long countByUserIdAndAcknowledgedFalse(Long userId);
    boolean existsByUserIdAndCompanyNameAndDomain(Long userId, String companyName, String domain);
}
