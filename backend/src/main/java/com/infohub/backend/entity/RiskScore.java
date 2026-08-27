package com.infohub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "risk_scores")
public class RiskScore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private Double score;

    private LocalDateTime recordedAt = LocalDateTime.now();

    public RiskScore() {}

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public Double getScore() { return score; }
    public LocalDateTime getRecordedAt() { return recordedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setScore(Double score) { this.score = score; }
    public void setRecordedAt(LocalDateTime recordedAt) { this.recordedAt = recordedAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final RiskScore rs = new RiskScore();
        public Builder user(User v) { rs.user = v; return this; }
        public Builder score(Double v) { rs.score = v; return this; }
        public Builder recordedAt(LocalDateTime v) { rs.recordedAt = v; return this; }
        public RiskScore build() { return rs; }
    }
}
