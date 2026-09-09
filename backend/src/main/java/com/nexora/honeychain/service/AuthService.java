package com.nexora.honeychain.service;

import com.nexora.honeychain.dto.auth.AuthResponse;
import com.nexora.honeychain.dto.auth.LoginRequest;
import com.nexora.honeychain.dto.auth.RegisterRequest;
import com.nexora.honeychain.dto.auth.UserResponse;
import com.nexora.honeychain.exception.ResourceAlreadyExistsException;
import com.nexora.honeychain.exception.ResourceNotFoundException;
import com.nexora.honeychain.model.User;
import com.nexora.honeychain.model.enums.UserRole;
import com.nexora.honeychain.repository.UserRepository;
import com.nexora.honeychain.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResourceAlreadyExistsException("Username '" + request.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResourceAlreadyExistsException("Email '" + request.getEmail() + "' is already registered.");
        }

        UserRole role = request.getRole() != null ? request.getRole() : UserRole.BEEKEEPER;
        String encodedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(request.getUsername(), request.getEmail(), encodedPassword, role, true);
        User savedUser = userRepository.save(user);

        String token = jwtService.generateToken(savedUser);
        return new AuthResponse(token, jwtService.getExpirationInSeconds(), savedUser.getUsername(), savedUser.getRole());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsername(), request.getUsername())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid username or password.");
        }

        if (!user.isEnabled()) {
            throw new DisabledException("User account is disabled.");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, jwtService.getExpirationInSeconds(), user.getUsername(), user.getRole());
    }

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return new UserResponse(user);
    }
}
