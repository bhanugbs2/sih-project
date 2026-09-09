package com.nexora.honeychain.dto.auth;

import com.nexora.honeychain.model.enums.UserRole;

public class AuthResponse {

    private String token;
    private String tokenType = "Bearer";
    private long expiresIn;
    private String username;
    private UserRole role;

    public AuthResponse() {}

    public AuthResponse(String token, long expiresIn, String username, UserRole role) {
        this.token = token;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.username = username;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public long getExpiresIn() { return expiresIn; }
    public void setExpiresIn(long expiresIn) { this.expiresIn = expiresIn; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
}
