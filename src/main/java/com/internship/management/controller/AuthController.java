package com.internship.management.controller;

import com.internship.management.dto.AuthRequest;
import com.internship.management.dto.AuthResponse;
import com.internship.management.dto.CreateUserRequest;
import com.internship.management.model.User;
import com.internship.management.repository.UserRepository;
import com.internship.management.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody AuthRequest request) {
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        // Check password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid credentials");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Check if user is active
        if (!user.isActive()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Account is deactivated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // Generate token
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

        return ResponseEntity.ok(new AuthResponse(
                token,
                user.getEmail(),
                user.getFullName(),
                user.getRole()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody CreateUserRequest request) {
        // Check if user exists
        if (userRepository.existsByEmail(request.getEmail())) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email already exists");
            return ResponseEntity.badRequest().body(error);
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setRole(request.getRole() != null ? request.getRole() : "INTERN");
        user.setActive(true);
        user.setPhone(request.getPhone());
        user.setDepartment(request.getDepartment());
        user.setUniversity(request.getUniversity());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User created successfully");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}