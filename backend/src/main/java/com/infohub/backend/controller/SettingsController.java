package com.infohub.backend.controller;

import com.infohub.backend.dto.ApiResponse;
import com.infohub.backend.entity.User;
import com.infohub.backend.repository.UserRepository;
import com.infohub.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSettings(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        Map<String, Object> settings = Map.of(
                "email", user.getEmail(),
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : "",
                "theme", user.getTheme(),
                "emailBreachAlerts", user.isEmailBreachAlerts(),
                "emailDeadlineReminders", user.isEmailDeadlineReminders(),
                "inAppNotifications", user.isInAppNotifications(),
                "twoFactorEnabled", user.isTwoFactorEnabled()
        );
        return ResponseEntity.ok(ApiResponse.ok(settings));
    }

    @PutMapping("/account")
    public ResponseEntity<ApiResponse<Void>> updateAccount(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        if (body.containsKey("displayName")) user.setDisplayName(body.get("displayName"));
        if (body.containsKey("theme")) user.setTheme(body.get("theme"));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Account updated", null));
    }

    @PutMapping("/security")
    public ResponseEntity<ApiResponse<Void>> updateSecurity(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        if (body.containsKey("newPassword") && body.containsKey("currentPassword")) {
            if (!passwordEncoder.matches(body.get("currentPassword"), user.getPasswordHash())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Current password is incorrect"));
            }
            user.setPasswordHash(passwordEncoder.encode(body.get("newPassword")));
        }
        if (body.containsKey("twoFactorEnabled")) {
            user.setTwoFactorEnabled(Boolean.parseBoolean(body.get("twoFactorEnabled")));
        }
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Security settings updated", null));
    }

    @PutMapping("/notifications")
    public ResponseEntity<ApiResponse<Void>> updateNotifications(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        if (body.containsKey("emailBreachAlerts"))
            user.setEmailBreachAlerts((Boolean) body.get("emailBreachAlerts"));
        if (body.containsKey("emailDeadlineReminders"))
            user.setEmailDeadlineReminders((Boolean) body.get("emailDeadlineReminders"));
        if (body.containsKey("inAppNotifications"))
            user.setInAppNotifications((Boolean) body.get("inAppNotifications"));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Notification preferences updated", null));
    }

    @GetMapping("/export")
    public ResponseEntity<ApiResponse<Map<String, Object>>> exportData(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        Map<String, Object> export = Map.of(
                "userId", user.getId(),
                "email", user.getEmail(),
                "displayName", user.getDisplayName() != null ? user.getDisplayName() : "",
                "createdAt", user.getCreatedAt(),
                "message", "Full data export. Download your companies and breaches via respective endpoints."
        );
        return ResponseEntity.ok(ApiResponse.ok(export));
    }
}
