package com.infohub.backend.controller;

import com.infohub.backend.dto.ApiResponse;
import com.infohub.backend.entity.Breach;
import com.infohub.backend.entity.User;
import com.infohub.backend.service.AuthService;
import com.infohub.backend.service.BreachService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/breaches")
@RequiredArgsConstructor
public class BreachController {

    private final BreachService breachService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Breach>>> getBreaches(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(breachService.getBreachesForUser(user.getId())));
    }

    @PostMapping("/check")
    public ResponseEntity<ApiResponse<List<Breach>>> checkBreaches(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        List<Breach> newBreaches = breachService.checkAndSyncBreaches(user);
        return ResponseEntity.ok(ApiResponse.ok(
                newBreaches.isEmpty() ? "No new breaches found" : newBreaches.size() + " new breach(es) detected",
                newBreaches));
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<ApiResponse<Void>> acknowledge(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        breachService.acknowledgeBreachById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Breach acknowledged", null));
    }
}
