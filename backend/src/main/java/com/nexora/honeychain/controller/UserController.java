package com.nexora.honeychain.controller;

import com.nexora.honeychain.dto.auth.RegisterRequest;
import com.nexora.honeychain.dto.auth.UpdateUserEnabledRequest;
import com.nexora.honeychain.dto.auth.UserResponse;
import com.nexora.honeychain.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "User Management API", description = "Admin-only endpoints for managing user accounts and roles")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "List all users", description = "Returns all registered users in the system (Admin only).")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user by ID", description = "Retrieves user details by unique identifier (Admin only).")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PostMapping
    @Operation(summary = "Create user", description = "Creates a new user account with specified role (Admin only).")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody RegisterRequest request) {
        UserResponse response = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user", description = "Updates details and role of an existing user (Admin only).")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String id,
            @Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(userService.updateUser(id, request));
    }

    @PatchMapping("/{id}/enabled")
    @Operation(summary = "Toggle user enabled status", description = "Enables or disables a user account (Admin only).")
    public ResponseEntity<UserResponse> toggleUserEnabled(
            @PathVariable String id,
            @RequestBody(required = false) UpdateUserEnabledRequest request) {
        Boolean enabled = request != null ? request.getEnabled() : null;
        return ResponseEntity.ok(userService.toggleUserEnabled(id, enabled));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Set user status", description = "Sets enabled status of a user account (Admin only).")
    public ResponseEntity<UserResponse> updateUserStatus(
            @PathVariable String id,
            @RequestBody(required = false) UpdateUserEnabledRequest request) {
        Boolean enabled = request != null ? request.getEnabled() : null;
        return ResponseEntity.ok(userService.toggleUserEnabled(id, enabled));
    }

    @PatchMapping("/{id}/role")
    @Operation(summary = "Update user role", description = "Assigns a new role to an existing user (Admin only).")
    public ResponseEntity<UserResponse> updateUserRole(
            @PathVariable String id,
            @Valid @RequestBody com.nexora.honeychain.dto.auth.UpdateUserRoleRequest request) {
        return ResponseEntity.ok(userService.updateUserRole(id, request.getRole()));
    }
}
