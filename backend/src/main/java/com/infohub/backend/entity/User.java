package com.infohub.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    private String displayName;
    private String profilePhoto;
    private boolean isActive = true;
    private boolean twoFactorEnabled = false;
    private String theme = "dark";
    private boolean emailBreachAlerts = true;
    private boolean emailDeadlineReminders = true;
    private boolean inAppNotifications = true;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public User() {}

    // Getters
    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getDisplayName() { return displayName; }
    public String getProfilePhoto() { return profilePhoto; }
    public boolean isActive() { return isActive; }
    public boolean isTwoFactorEnabled() { return twoFactorEnabled; }
    public String getTheme() { return theme; }
    public boolean isEmailBreachAlerts() { return emailBreachAlerts; }
    public boolean isEmailDeadlineReminders() { return emailDeadlineReminders; }
    public boolean isInAppNotifications() { return inAppNotifications; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setEmail(String email) { this.email = email; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public void setProfilePhoto(String profilePhoto) { this.profilePhoto = profilePhoto; }
    public void setActive(boolean active) { isActive = active; }
    public void setTwoFactorEnabled(boolean twoFactorEnabled) { this.twoFactorEnabled = twoFactorEnabled; }
    public void setTheme(String theme) { this.theme = theme; }
    public void setEmailBreachAlerts(boolean emailBreachAlerts) { this.emailBreachAlerts = emailBreachAlerts; }
    public void setEmailDeadlineReminders(boolean emailDeadlineReminders) { this.emailDeadlineReminders = emailDeadlineReminders; }
    public void setInAppNotifications(boolean inAppNotifications) { this.inAppNotifications = inAppNotifications; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // Builder
    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final User user = new User();
        public Builder email(String v) { user.email = v; return this; }
        public Builder passwordHash(String v) { user.passwordHash = v; return this; }
        public Builder displayName(String v) { user.displayName = v; return this; }
        public Builder profilePhoto(String v) { user.profilePhoto = v; return this; }
        public Builder isActive(boolean v) { user.isActive = v; return this; }
        public Builder twoFactorEnabled(boolean v) { user.twoFactorEnabled = v; return this; }
        public Builder theme(String v) { user.theme = v; return this; }
        public Builder emailBreachAlerts(boolean v) { user.emailBreachAlerts = v; return this; }
        public Builder emailDeadlineReminders(boolean v) { user.emailDeadlineReminders = v; return this; }
        public Builder inAppNotifications(boolean v) { user.inAppNotifications = v; return this; }
        public User build() { return user; }
    }
}
