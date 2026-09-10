package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.auth.RegisterRequest;
import com.nexora.honeychain.dto.auth.UserResponse;
import com.nexora.honeychain.exception.ResourceAlreadyExistsException;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.model.User;
import com.nexora.honeychain.model.enums.UserRole;
import com.nexora.honeychain.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return new UserResponse(user);
    }

    @Transactional
    public UserResponse createUser(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email '" + request.getEmail() + "' is already registered.");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.BEEKEEPER;
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(request.getUsername(), request.getEmail(), encodedPassword, role, true);
        User saved = userRepository.save(user);
        return new UserResponse(saved);
    }

    @Transactional
    public UserResponse updateUser(String id, RegisterRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (!user.getUsername().equals(request.getUsername()) && userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email '" + request.getEmail() + "' is already registered.");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        User updated = userRepository.save(user);
        return new UserResponse(updated);
    }

    @Transactional
    public UserResponse toggleUserEnabled(String id, Boolean enabled) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setEnabled(enabled != null ? enabled : !user.isEnabled());
        User updated = userRepository.save(user);
        return new UserResponse(updated);
    }

    @Transactional
    public UserResponse updateUserRole(String id, UserRole role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (role != null) {
            user.setRole(role);
        }
        User updated = userRepository.save(user);
        return new UserResponse(updated);
    }
}
