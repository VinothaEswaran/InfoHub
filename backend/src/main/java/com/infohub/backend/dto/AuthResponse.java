package com.infohub.backend.dto;

public class AuthResponse {

    private String token;
    private String email;
    private String displayName;
    private Long userId;

    public AuthResponse() {}

    public AuthResponse(String token, String email, String displayName, Long userId) {
        this.token = token;
        this.email = email;
        this.displayName = displayName;
        this.userId = userId;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
