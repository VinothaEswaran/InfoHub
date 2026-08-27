package com.infohub.backend.repository;

import com.infohub.backend.entity.Company;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByUserId(Long userId);
    long countByUserId(Long userId);

    @Query("SELECT c FROM Company c WHERE c.user.id = :userId AND " +
           "(:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Company> findByUserIdWithSearch(@Param("userId") Long userId,
                                          @Param("search") String search,
                                          Pageable pageable);

    @Query("SELECT AVG(c.riskScore) FROM Company c WHERE c.user.id = :userId")
    Double avgRiskScoreByUserId(@Param("userId") Long userId);
}
