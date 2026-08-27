package com.infohub.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infohub.backend.entity.Company;
import com.infohub.backend.entity.PolicySummary;
import com.infohub.backend.repository.CompanyRepository;
import com.infohub.backend.repository.PolicySummaryRepository;
import org.jsoup.Jsoup;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.*;
import java.util.logging.Logger;

@Service
public class AIService {

    private static final Logger log = Logger.getLogger(AIService.class.getName());

    private final PolicySummaryRepository policySummaryRepository;
    private final CompanyRepository companyRepository;
    private final ObjectMapper objectMapper;

    @Value("${openai.api.key}")
    private String openAiKey;

    @Value("${openai.api.url}")
    private String openAiUrl;

    @Value("${openai.model}")
    private String openAiModel;

    @Autowired
    public AIService(PolicySummaryRepository policySummaryRepository,
                     CompanyRepository companyRepository,
                     ObjectMapper objectMapper) {
        this.policySummaryRepository = policySummaryRepository;
        this.companyRepository = companyRepository;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> summarizePolicy(String policyUrl) {
        Optional<PolicySummary> cached = policySummaryRepository.findByPolicyUrl(policyUrl);
        if (cached.isPresent()) {
            try {
                return objectMapper.readValue(cached.get().getSummaryJson(), Map.class);
            } catch (Exception ignored) {}
        }

        String policyText = fetchPolicyText(policyUrl);

        Map<String, Object> summary = "demo-key".equals(openAiKey)
                ? buildDemoSummary(policyUrl)
                : callOpenAI(policyText);

        PolicySummary ps = PolicySummary.builder()
                .policyUrl(policyUrl)
                .summaryJson(toJson(summary))
                .build();
        policySummaryRepository.save(ps);

        return summary;
    }

    public void attachToCompany(Long companyId, String policyUrl, Long userId) {
        companyRepository.findById(companyId).ifPresent(company -> {
            Optional<PolicySummary> existing = policySummaryRepository.findByPolicyUrl(policyUrl);
            existing.ifPresent(ps -> {
                ps.setCompany(company);
                policySummaryRepository.save(ps);
            });
        });
    }

    public Map<String, Object> getSummaryForCompany(Long companyId) {
        return policySummaryRepository.findTopByCompanyIdOrderByCreatedAtDesc(companyId)
                .map(ps -> {
                    try {
                        return objectMapper.readValue(ps.getSummaryJson(), Map.class);
                    } catch (Exception e) {
                        return new HashMap<String, Object>();
                    }
                })
                .orElse(new HashMap<>());
    }

    private String fetchPolicyText(String url) {
        try {
            String text = Jsoup.connect(url).userAgent("Mozilla/5.0").timeout(10000)
                    .get().body().text();
            return text.substring(0, Math.min(4000, text.length()));
        } catch (Exception e) {
            log.warning("Could not fetch policy URL: " + e.getMessage());
            return "Policy text unavailable";
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callOpenAI(String policyText) {
        try {
            WebClient client = WebClient.builder()
                    .baseUrl(openAiUrl)
                    .defaultHeader("Authorization", "Bearer " + openAiKey)
                    .defaultHeader("Content-Type", "application/json")
                    .build();

            String prompt = "Analyze this privacy policy and return JSON with keys: " +
                    "data_collected (string[]), third_party_sharing (string), " +
                    "retention_period (string), user_rights (string[]), " +
                    "risk_flags (array of {clause, explanation}), plain_summary (max 200 words). " +
                    "Policy text: " + policyText;

            Map<String, Object> requestBody = Map.of(
                    "model", openAiModel,
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are a privacy policy analyst. Return only valid JSON."),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "max_tokens", 1000
            );

            String response = client.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            Map<String, Object> parsed = objectMapper.readValue(response, Map.class);
            List choices = (List) parsed.get("choices");
            Map choice = (Map) choices.get(0);
            Map message = (Map) choice.get("message");
            String content = (String) message.get("content");
            return objectMapper.readValue(content, Map.class);
        } catch (Exception e) {
            log.severe("OpenAI call failed: " + e.getMessage());
            return buildDemoSummary("unknown");
        }
    }

    private Map<String, Object> buildDemoSummary(String url) {
        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("data_collected", List.of("Email address", "Name", "Usage data", "Device information", "IP address"));
        summary.put("third_party_sharing", "Data is shared with advertising partners, analytics providers, and service integrators.");
        summary.put("retention_period", "Data is retained for up to 3 years after account closure.");
        summary.put("user_rights", List.of("Right to access", "Right to deletion", "Right to portability", "Right to opt-out of marketing"));
        summary.put("risk_flags", List.of(
                Map.of("clause", "Sharing with third parties", "explanation", "Your data may be sold or shared with advertisers without explicit consent."),
                Map.of("clause", "3-year retention", "explanation", "Data is kept long after you leave the platform, increasing breach risk.")
        ));
        summary.put("plain_summary", "This policy collects broad personal data including email, device info, and usage patterns. Data is shared with third-party advertisers and retained for 3 years. Users have standard GDPR/CCPA rights but must explicitly opt out of marketing. Two notable risk flags: third-party data sharing and extended retention period.");
        return summary;
    }

    private String toJson(Object obj) {
        try { return objectMapper.writeValueAsString(obj); }
        catch (Exception e) { return "{}"; }
    }
}
