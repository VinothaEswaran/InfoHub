package com.infohub.backend.controller;

import com.infohub.backend.dto.ApiResponse;
import com.infohub.backend.entity.User;
import com.infohub.backend.service.AuthService;
import com.infohub.backend.service.RiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskService riskService;
    private final AuthService authService;

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSummary(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(riskService.getRiskSummary(user.getId())));
    }

    @GetMapping("/breakdown")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getBreakdown(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(riskService.getCompanyBreakdown(user.getId())));
    }

    @GetMapping("/recommendations")
    public ResponseEntity<ApiResponse<List<String>>> getRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(riskService.getRecommendations(user.getId())));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(riskService.getRiskHistory(user.getId())));
    }
}
