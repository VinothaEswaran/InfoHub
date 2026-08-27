package com.infohub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String body;

    private boolean isRead = false;
    private String actionUrl;
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum NotificationType { BreachAlert, DeadlineReminder, StatusUpdate, AIRecommendation }

    public Notification() {}

    // Getters
    public Long getId() { return id; }
    public User getUser() { return user; }
    public NotificationType getType() { return type; }
    public String getTitle() { return title; }
    public String getBody() { return body; }
    public boolean isRead() { return isRead; }
    public String getActionUrl() { return actionUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setUser(User user) { this.user = user; }
    public void setType(NotificationType type) { this.type = type; }
    public void setTitle(String title) { this.title = title; }
    public void setBody(String body) { this.body = body; }
    public void setRead(boolean read) { isRead = read; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Notification n = new Notification();
        public Builder user(User v) { n.user = v; return this; }
        public Builder type(NotificationType v) { n.type = v; return this; }
        public Builder title(String v) { n.title = v; return this; }
        public Builder body(String v) { n.body = v; return this; }
        public Builder actionUrl(String v) { n.actionUrl = v; return this; }
        public Builder isRead(boolean v) { n.isRead = v; return this; }
        public Notification build() { return n; }
    }
}
