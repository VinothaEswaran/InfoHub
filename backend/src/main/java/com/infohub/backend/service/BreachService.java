package com.infohub.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.infohub.backend.entity.Breach;
import com.infohub.backend.entity.User;
import com.infohub.backend.repository.BreachRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.time.LocalDate;
import java.util.*;
import java.util.logging.Logger;

@Service
public class BreachService {

    private static final Logger log = Logger.getLogger(BreachService.class.getName());

    private final BreachRepository breachRepository;
    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @Value("${hibp.api.key}")
    private String hibpApiKey;

    @Value("${hibp.api.url}")
    private String hibpApiUrl;

    private static final List<Map<String, Object>> DEMO_BREACHES = List.of(
        Map.of("Name","Adobe","BreachDate","2013-10-04","DataClasses",List.of("Email addresses","Passwords","Usernames"),"Domain","adobe.com"),
        Map.of("Name","LinkedIn","BreachDate","2012-05-05","DataClasses",List.of("Email addresses","Passwords"),"Domain","linkedin.com"),
        Map.of("Name","Dropbox","BreachDate","2012-07-01","DataClasses",List.of("Email addresses","Passwords"),"Domain","dropbox.com")
    );

    @Autowired
    public BreachService(BreachRepository breachRepository,
                         NotificationService notificationService,
                         ObjectMapper objectMapper) {
        this.breachRepository = breachRepository;
        this.notificationService = notificationService;
        this.objectMapper = objectMapper;
    }

    public List<Breach> getBreachesForUser(Long userId) {
        return breachRepository.findByUserIdOrderByDetectedAtDesc(userId);
    }

    public List<Breach> checkAndSyncBreaches(User user) {
        boolean isDemoKey = "demo-key".equals(hibpApiKey);
        if (isDemoKey) {
            return syncDemoBreaches(user);
        }
        try {
            return syncHibpBreaches(user);
        } catch (Exception e) {
            log.warning("HIBP API unavailable, falling back to demo data: " + e.getMessage());
            return syncDemoBreaches(user);
        }
    }

    private List<Breach> syncDemoBreaches(User user) {
        List<Breach> saved = new ArrayList<>();
        for (Map<String, Object> demo : DEMO_BREACHES) {
            String name = (String) demo.get("Name");
            String domain = (String) demo.get("Domain");
            if (!breachRepository.existsByUserIdAndCompanyNameAndDomain(user.getId(), name, domain)) {
                Breach breach = Breach.builder()
                        .user(user)
                        .companyName(name)
                        .domain(domain)
                        .breachDate(LocalDate.parse((String) demo.get("BreachDate")))
                        .dataExposed(demo.get("DataClasses").toString())
                        .severity(Breach.Severity.High)
                        .build();
                saved.add(breachRepository.save(breach));
                notificationService.createBreachAlert(user, name);
            }
        }
        return saved;
    }

    private List<Breach> syncHibpBreaches(User user) throws Exception {
        WebClient client = WebClient.builder()
                .baseUrl(hibpApiUrl)
                .defaultHeader("hibp-api-key", hibpApiKey)
                .defaultHeader("User-Agent", "InfoHub-App")
                .build();

        String response = client.get()
                .uri("/breachedaccount/" + user.getEmail() + "?truncateResponse=false")
                .retrieve()
                .bodyToMono(String.class)
                .block();

        List<Breach> saved = new ArrayList<>();
        if (response != null) {
            JsonNode breaches = objectMapper.readTree(response);
            for (JsonNode b : breaches) {
                String name = b.get("Name").asText();
                String domain = b.has("Domain") ? b.get("Domain").asText() : "";
                if (!breachRepository.existsByUserIdAndCompanyNameAndDomain(user.getId(), name, domain)) {
                    String date = b.has("BreachDate") ? b.get("BreachDate").asText() : LocalDate.now().toString();
                    Breach breach = Breach.builder()
                            .user(user)
                            .companyName(name)
                            .domain(domain)
                            .breachDate(LocalDate.parse(date))
                            .dataExposed(b.has("DataClasses") ? b.get("DataClasses").toString() : "[]")
                            .severity(Breach.Severity.High)
                            .build();
                    saved.add(breachRepository.save(breach));
                    notificationService.createBreachAlert(user, name);
                }
            }
        }
        return saved;
    }

    public void acknowledgeBreachById(Long breachId, Long userId) {
        breachRepository.findById(breachId).ifPresent(b -> {
            if (b.getUser().getId().equals(userId)) {
                b.setAcknowledged(true);
                breachRepository.save(b);
            }
        });
    }

    public long getUnacknowledgedCount(Long userId) {
        return breachRepository.countByUserIdAndAcknowledgedFalse(userId);
    }
}
