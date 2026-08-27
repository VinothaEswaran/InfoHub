package com.infohub.backend.controller;

import com.infohub.backend.dto.ApiResponse;
import com.infohub.backend.entity.User;
import com.infohub.backend.service.AIService;
import com.infohub.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final AIService aiService;
    private final AuthService authService;

    @Autowired
    public AIController(AIService aiService, AuthService authService) {
        this.aiService = aiService;
        this.authService = authService;
    }

    @PostMapping("/summarize")
    public ResponseEntity<ApiResponse<Map<String, Object>>> summarize(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        String url = body.get("url");
        if (url == null || url.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("URL is required"));
        }
        return ResponseEntity.ok(ApiResponse.ok(aiService.summarizePolicy(url)));
    }

    @PostMapping("/save-summary/{companyId}")
    public ResponseEntity<ApiResponse<Void>> saveSummary(
            @PathVariable Long companyId,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        aiService.attachToCompany(companyId, body.get("policyUrl"), user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Summary saved", null));
    }

    @GetMapping("/summary/{companyId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(
            @PathVariable Long companyId,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(aiService.getSummaryForCompany(companyId)));
    }
}
