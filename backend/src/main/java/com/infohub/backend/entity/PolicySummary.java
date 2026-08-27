package com.infohub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "policy_summaries")
public class PolicySummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @Column(nullable = false, length = 500)
    private String policyUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String summaryJson;

    private LocalDateTime createdAt = LocalDateTime.now();

    public PolicySummary() {}

    // Getters
    public Long getId() { return id; }
    public Company getCompany() { return company; }
    public String getPolicyUrl() { return policyUrl; }
    public String getSummaryJson() { return summaryJson; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setCompany(Company company) { this.company = company; }
    public void setPolicyUrl(String policyUrl) { this.policyUrl = policyUrl; }
    public void setSummaryJson(String summaryJson) { this.summaryJson = summaryJson; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final PolicySummary ps = new PolicySummary();
        public Builder company(Company v) { ps.company = v; return this; }
        public Builder policyUrl(String v) { ps.policyUrl = v; return this; }
        public Builder summaryJson(String v) { ps.summaryJson = v; return this; }
        public PolicySummary build() { return ps; }
    }
}
