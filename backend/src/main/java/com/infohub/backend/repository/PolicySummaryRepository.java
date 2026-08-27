package com.infohub.backend.repository;

import com.infohub.backend.entity.PolicySummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PolicySummaryRepository extends JpaRepository<PolicySummary, Long> {
    Optional<PolicySummary> findByPolicyUrl(String policyUrl);
    Optional<PolicySummary> findTopByCompanyIdOrderByCreatedAtDesc(Long companyId);
}
