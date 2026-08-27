package com.infohub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "deletion_requests")
public class DeletionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Jurisdiction jurisdiction;

    @Enumerated(EnumType.STRING)
    private Status status = Status.Draft;

    private String pdfPath;
    private LocalDateTime sentAt;
    private LocalDate deadline;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum Jurisdiction { GDPR, DPDP, CCPA }
    public enum Status { Draft, Sent, Acknowledged, Completed, Overdue }

    public DeletionRequest() {}

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public Company getCompany() { return company; }
    public Jurisdiction getJurisdiction() { return jurisdiction; }
    public Status getStatus() { return status; }
    public String getPdfPath() { return pdfPath; }
    public LocalDateTime getSentAt() { return sentAt; }
    public LocalDate getDeadline() { return deadline; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setCompany(Company company) { this.company = company; }
    public void setJurisdiction(Jurisdiction jurisdiction) { this.jurisdiction = jurisdiction; }
    public void setStatus(Status status) { this.status = status; }
    public void setPdfPath(String pdfPath) { this.pdfPath = pdfPath; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public void setDeadline(LocalDate deadline) { this.deadline = deadline; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final DeletionRequest r = new DeletionRequest();
        public Builder user(User v) { r.user = v; return this; }
        public Builder company(Company v) { r.company = v; return this; }
        public Builder jurisdiction(Jurisdiction v) { r.jurisdiction = v; return this; }
        public Builder status(Status v) { r.status = v; return this; }
        public Builder deadline(LocalDate v) { r.deadline = v; return this; }
        public Builder pdfPath(String v) { r.pdfPath = v; return this; }
        public DeletionRequest build() { return r; }
    }
}
