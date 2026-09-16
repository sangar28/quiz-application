package com.quiz.backend.util;

import com.quiz.backend.entity.User;
import com.quiz.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.OAuth2AuthenticatedPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        String email = null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof OidcUser oidcUser) {
            email = oidcUser.getAttribute("email");
        } else if (principal instanceof OAuth2AuthenticatedPrincipal oauth2Principal) {
            email = oauth2Principal.getAttribute("email");
        }

        if (email == null) {
            email = authentication.getName();
        }

        if (email == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unable to extract email from authenticated principal");
        }

        final String lookupEmail = email;
        return userRepository.findByEmail(lookupEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found in database for email: " + lookupEmail));
    }
}
