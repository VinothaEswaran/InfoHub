package com.infohub.backend.service;

import com.infohub.backend.entity.Notification;
import com.infohub.backend.entity.User;
import com.infohub.backend.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Autowired
    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public List<Notification> getNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public void markRead(Long id, Long userId) {
        notificationRepository.findById(id).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllRead(Long userId) {
        notificationRepository.markAllReadByUserId(userId);
    }

    public void createBreachAlert(User user, String companyName) {
        Notification n = Notification.builder()
                .user(user)
                .type(Notification.NotificationType.BreachAlert)
                .title("Data Breach Detected: " + companyName)
                .body("Your data was found in a breach at " + companyName +
                      ". Change your password and enable 2FA immediately.")
                .actionUrl("/breach-monitor")
                .build();
        notificationRepository.save(n);
    }

    public void createDeadlineReminder(User user, String companyName, int daysLeft) {
        Notification n = Notification.builder()
                .user(user)
                .type(Notification.NotificationType.DeadlineReminder)
                .title("Deletion Deadline: " + daysLeft + " day(s) left — " + companyName)
                .body(companyName + " has " + daysLeft + " day(s) to respond to your deletion request.")
                .actionUrl("/deletion-requests")
                .build();
        notificationRepository.save(n);
    }

    public void createStatusUpdate(User user, String companyName, String status) {
        Notification n = Notification.builder()
                .user(user)
                .type(Notification.NotificationType.StatusUpdate)
                .title("Deletion Request Updated: " + companyName)
                .body("Your deletion request for " + companyName + " has been updated to: " + status)
                .actionUrl("/deletion-requests")
                .build();
        notificationRepository.save(n);
    }

    public void createAIRecommendation(User user, String message) {
        Notification n = Notification.builder()
                .user(user)
                .type(Notification.NotificationType.AIRecommendation)
                .title("Privacy Recommendation")
                .body(message)
                .actionUrl("/risk-analysis")
                .build();
        notificationRepository.save(n);
    }
}
