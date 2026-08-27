package com.infohub.backend.service;

import com.infohub.backend.entity.Company;
import com.infohub.backend.entity.RiskScore;
import com.infohub.backend.entity.User;
import com.infohub.backend.repository.BreachRepository;
import com.infohub.backend.repository.CompanyRepository;
import com.infohub.backend.repository.RiskScoreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class RiskService {

    private final CompanyRepository companyRepository;
    private final RiskScoreRepository riskScoreRepository;
    private final BreachRepository breachRepository;

    @Autowired
    public RiskService(CompanyRepository companyRepository,
                       RiskScoreRepository riskScoreRepository,
                       BreachRepository breachRepository) {
        this.companyRepository = companyRepository;
        this.riskScoreRepository = riskScoreRepository;
        this.breachRepository = breachRepository;
    }

    public double calculateOverallRisk(Long userId) {
        List<Company> companies = companyRepository.findByUserId(userId);
        if (companies.isEmpty()) return 0.0;
        double avg = companies.stream()
                .mapToDouble(c -> c.getRiskScore() != null ? c.getRiskScore() : 0.0)
                .average()
                .orElse(0.0);
        long breachCount = breachRepository.findByUserId(userId).size();
        double breachPenalty = Math.min(breachCount * 5, 30);
        return Math.min(avg + breachPenalty, 100.0);
    }

    public Map<String, Object> getRiskSummary(Long userId) {
        double overall = calculateOverallRisk(userId);
        Optional<RiskScore> latest = riskScoreRepository.findTopByUserIdOrderByRecordedAtDesc(userId);
        double previous = latest.map(RiskScore::getScore).orElse(overall);
        double change = overall - previous;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("overallScore", Math.round(overall * 10.0) / 10.0);
        result.put("riskLevel", getRiskLevel(overall));
        result.put("change", Math.round(change * 10.0) / 10.0);
        result.put("healthScore", Math.round((100 - overall) * 10.0) / 10.0);
        return result;
    }

    public List<Map<String, Object>> getRiskHistory(Long userId) {
        LocalDateTime since = LocalDateTime.now().minusDays(90);
        List<RiskScore> history = riskScoreRepository
                .findByUserIdAndRecordedAtAfterOrderByRecordedAtAsc(userId, since);
        List<Map<String, Object>> result = new ArrayList<>();
        for (RiskScore rs : history) {
            Map<String, Object> point = new LinkedHashMap<>();
            point.put("date", rs.getRecordedAt().toLocalDate().toString());
            point.put("score", rs.getScore());
            result.add(point);
        }
        return result;
    }

    public List<Map<String, Object>> getCompanyBreakdown(Long userId) {
        List<Company> companies = companyRepository.findByUserId(userId);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Company c : companies) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("name", c.getName());
            item.put("score", c.getRiskScore());
            item.put("level", c.getRiskLevel());
            item.put("dataCategories", c.getDataCategories());
            result.add(item);
        }
        result.sort((a, b) -> Double.compare(
                (Double) b.get("score"), (Double) a.get("score")));
        return result;
    }

    public List<String> getRecommendations(Long userId) {
        List<Company> companies = companyRepository.findByUserId(userId);
        List<String> recs = new ArrayList<>();
        long criticalCount = companies.stream().filter(c -> "Critical".equals(c.getRiskLevel())).count();
        long highCount = companies.stream().filter(c -> "High".equals(c.getRiskLevel())).count();
        long breaches = breachRepository.countByUserIdAndAcknowledgedFalse(userId);

        if (criticalCount > 0)
            recs.add("You have " + criticalCount + " company(ies) with Critical risk. Send deletion requests immediately.");
        if (highCount > 0)
            recs.add("Review " + highCount + " High-risk company(ies) and consider data minimization.");
        if (breaches > 0)
            recs.add(breaches + " unacknowledged breach(es) detected. Change passwords for affected services.");
        if (companies.size() > 10)
            recs.add("You are tracked by " + companies.size() + " companies. Consider reducing your digital footprint.");
        recs.add("Enable two-factor authentication on all accounts holding sensitive data.");
        recs.add("Review and update your privacy settings quarterly.");
        return recs;
    }

    public void recordRiskSnapshot(User user) {
        double score = calculateOverallRisk(user.getId());
        RiskScore rs = RiskScore.builder().user(user).score(score).build();
        riskScoreRepository.save(rs);
    }

    @Scheduled(cron = "0 0 2 * * *")
    public void recordDailyRiskSnapshots() {
        // Handled per-user via recordRiskSnapshot
    }

    private String getRiskLevel(double score) {
        if (score < 25) return "Low";
        if (score < 50) return "Medium";
        if (score < 75) return "High";
        return "Critical";
    }
}
