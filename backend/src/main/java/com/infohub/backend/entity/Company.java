package com.infohub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    private String website;
    private String privacyPolicyUrl;

    @Column(columnDefinition = "TEXT")
    private String dataCategories;

    private Double riskScore = 0.0;
    private String riskLevel = "Low";
    private LocalDateTime addedAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public Company() {}

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getName() { return name; }
    public String getWebsite() { return website; }
    public String getPrivacyPolicyUrl() { return privacyPolicyUrl; }
    public String getDataCategories() { return dataCategories; }
    public Double getRiskScore() { return riskScore; }
    public String getRiskLevel() { return riskLevel; }
    public LocalDateTime getAddedAt() { return addedAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setName(String name) { this.name = name; }
    public void setWebsite(String website) { this.website = website; }
    public void setPrivacyPolicyUrl(String privacyPolicyUrl) { this.privacyPolicyUrl = privacyPolicyUrl; }
    public void setDataCategories(String dataCategories) { this.dataCategories = dataCategories; }
    public void setRiskScore(Double riskScore) { this.riskScore = riskScore; }
    public void setRiskLevel(String riskLevel) { this.riskLevel = riskLevel; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Company c = new Company();
        public Builder user(User v) { c.user = v; return this; }
        public Builder name(String v) { c.name = v; return this; }
        public Builder website(String v) { c.website = v; return this; }
        public Builder privacyPolicyUrl(String v) { c.privacyPolicyUrl = v; return this; }
        public Builder dataCategories(String v) { c.dataCategories = v; return this; }
        public Builder riskScore(Double v) { c.riskScore = v; return this; }
        public Builder riskLevel(String v) { c.riskLevel = v; return this; }
        public Company build() { return c; }
    }
}
