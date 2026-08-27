package com.infohub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "breaches")
public class Breach {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String companyName;
    private String domain;
    private LocalDate breachDate;

    @Column(columnDefinition = "TEXT")
    private String dataExposed;

    @Enumerated(EnumType.STRING)
    private Severity severity = Severity.Medium;

    private boolean acknowledged = false;
    private LocalDateTime detectedAt = LocalDateTime.now();

    public enum Severity { Low, Medium, High, Critical }

    public Breach() {}

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public String getCompanyName() { return companyName; }
    public String getDomain() { return domain; }
    public LocalDate getBreachDate() { return breachDate; }
    public String getDataExposed() { return dataExposed; }
    public Severity getSeverity() { return severity; }
    public boolean isAcknowledged() { return acknowledged; }
    public LocalDateTime getDetectedAt() { return detectedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
    public void setDomain(String domain) { this.domain = domain; }
    public void setBreachDate(LocalDate breachDate) { this.breachDate = breachDate; }
    public void setDataExposed(String dataExposed) { this.dataExposed = dataExposed; }
    public void setSeverity(Severity severity) { this.severity = severity; }
    public void setAcknowledged(boolean acknowledged) { this.acknowledged = acknowledged; }
    public void setDetectedAt(LocalDateTime detectedAt) { this.detectedAt = detectedAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Breach b = new Breach();
        public Builder user(User v) { b.user = v; return this; }
        public Builder companyName(String v) { b.companyName = v; return this; }
        public Builder domain(String v) { b.domain = v; return this; }
        public Builder breachDate(LocalDate v) { b.breachDate = v; return this; }
        public Builder dataExposed(String v) { b.dataExposed = v; return this; }
        public Builder severity(Severity v) { b.severity = v; return this; }
        public Builder acknowledged(boolean v) { b.acknowledged = v; return this; }
        public Breach build() { return b; }
    }
}
