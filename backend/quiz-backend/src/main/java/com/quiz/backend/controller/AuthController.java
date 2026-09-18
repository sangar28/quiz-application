package com.quiz.backend.controller;

import com.quiz.backend.dto.UpdateRollNumberRequestDTO;
import com.quiz.backend.entity.User;
import com.quiz.backend.repository.UserRepository;
import com.quiz.backend.util.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;

    public AuthController(UserRepository userRepository, SecurityUtils securityUtils) {
        this.userRepository = userRepository;
        this.securityUtils = securityUtils;
    }

    @GetMapping("/me")
    public Map<String, Object> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        List<String> authorities = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();

        try {
            User user = securityUtils.getCurrentUser();
            response.put("email", user.getEmail());
            response.put("name", user.getName());
            response.put("authorities", authorities);
            response.put("role", user.getRole() != null ? user.getRole().name() : "STUDENT");
            response.put("picture", user.getPicture());
            response.put("rollNumber", user.getRollNumber());
        } catch (Exception e) {
            if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
                response.put("email", oauth2User.getAttribute("email"));
                response.put("name", oauth2User.getAttribute("name"));
                response.put("authorities", authorities);
                response.put("role", "STUDENT");
                response.put("picture", oauth2User.getAttribute("picture"));
                response.put("rollNumber", null);
            } else {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
            }
        }
        return response;
    }

    @PostMapping("/roll-number")
    public ResponseEntity<Map<String, Object>> updateRollNumber(@Valid @RequestBody UpdateRollNumberRequestDTO request) {
        User user = securityUtils.getCurrentUser();
        String rollNumber = request.getRollNumber().trim().toUpperCase();
        user.setRollNumber(rollNumber);
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("email", user.getEmail());
        response.put("name", user.getName());
        response.put("role", user.getRole() != null ? user.getRole().name() : "STUDENT");
        response.put("picture", user.getPicture());
        response.put("rollNumber", user.getRollNumber());
        response.put("message", "Roll number updated successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();

        ResponseCookie cookie = ResponseCookie.from("JSESSIONID", "")
                .path("/")
                .maxAge(0)
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        Map<String, String> body = new HashMap<>();
        body.put("message", "Logged out successfully");
        return ResponseEntity.ok(body);
    }
}
