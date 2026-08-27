package com.infohub.backend.service;

import com.infohub.backend.entity.*;
import com.infohub.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final CompanyRepository companyRepository;
    private final BreachRepository breachRepository;
    private final DeletionRequestRepository deletionRequestRepository;
    private final NotificationRepository notificationRepository;
    private final RiskService riskService;

    public Map<String, Object> getSummary(Long userId) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("companiesCount", companyRepository.countByUserId(userId));
        summary.put("avgRiskScore", Math.round((companyRepository.avgRiskScoreByUserId(userId) != null
                ? companyRepository.avgRiskScoreByUserId(userId) : 0.0) * 10.0) / 10.0);
        summary.put("recentBreaches", breachRepository.countByUserIdAndAcknowledgedFalse(userId));
        summary.put("pendingRequests", deletionRequestRepository.countByUserIdAndStatusNotIn(userId,
                List.of(DeletionRequest.Status.Completed)));
        Map<String, Object> riskSummary = riskService.getRiskSummary(userId);
        summary.put("healthScore", riskSummary.get("healthScore"));
        summary.put("overallRisk", riskSummary.get("overallScore"));
        return summary;
    }

    public List<Map<String, Object>> getRecentActivity(Long userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        List<Map<String, Object>> activity = new ArrayList<>();
        int limit = Math.min(10, notifications.size());
        for (int i = 0; i < limit; i++) {
            Notification n = notifications.get(i);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", n.getId());
            item.put("type", n.getType());
            item.put("title", n.getTitle());
            item.put("body", n.getBody());
            item.put("time", n.getCreatedAt());
            item.put("read", n.isRead());
            activity.add(item);
        }
        return activity;
    }
}
