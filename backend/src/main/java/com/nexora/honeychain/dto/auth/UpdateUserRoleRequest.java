package com.nexora.honeychain.dto.auth;

import com.nexora.honeychain.model.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public class UpdateUserRoleRequest {

    @NotNull(message = "Role cannot be null")
    private UserRole role;

    public UpdateUserRoleRequest() {}

    public UpdateUserRoleRequest(UserRole role) {
        this.role = role;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }
}
