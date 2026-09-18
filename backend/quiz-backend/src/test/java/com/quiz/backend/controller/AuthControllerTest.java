package com.quiz.backend.controller;

import com.quiz.backend.dto.UpdateRollNumberRequestDTO;
import com.quiz.backend.entity.Role;
import com.quiz.backend.entity.User;
import com.quiz.backend.repository.UserRepository;
import com.quiz.backend.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityUtils securityUtils;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthController authController;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setName("Student Name");
        sampleUser.setEmail("student@college.edu");
        sampleUser.setRole(Role.STUDENT);
        sampleUser.setPicture("https://example.com/pic.jpg");
        sampleUser.setRollNumber("23CS101");
    }

    @Test
    void testGetCurrentUser_Success_IncludesRollNumber() {
        when(authentication.isAuthenticated()).thenReturn(true);
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_STUDENT"))).when(authentication).getAuthorities();
        when(securityUtils.getCurrentUser()).thenReturn(sampleUser);

        Map<String, Object> result = authController.getCurrentUser(authentication);

        assertNotNull(result);
        assertEquals("student@college.edu", result.get("email"));
        assertEquals("Student Name", result.get("name"));
        assertEquals("STUDENT", result.get("role"));
        assertEquals("23CS101", result.get("rollNumber"));
        assertEquals("https://example.com/pic.jpg", result.get("picture"));
    }

    @Test
    void testGetCurrentUser_Unauthenticated_ThrowsUnauthorized() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () ->
                authController.getCurrentUser(null)
        );
        assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
    }

    @Test
    void testUpdateRollNumber_Success() {
        when(securityUtils.getCurrentUser()).thenReturn(sampleUser);
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);

        UpdateRollNumberRequestDTO request = new UpdateRollNumberRequestDTO("23me999");
        ResponseEntity<Map<String, Object>> response = authController.updateRollNumber(request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("23ME999", sampleUser.getRollNumber(), "Roll number must be trimmed and uppercase");
        verify(userRepository, times(1)).save(sampleUser);
    }
}
