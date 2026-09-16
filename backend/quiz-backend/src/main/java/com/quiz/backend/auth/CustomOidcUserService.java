package com.quiz.backend.auth;

import com.quiz.backend.entity.User;
import com.quiz.backend.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.LinkedHashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class CustomOidcUserService extends OidcUserService {

    private final UserRepository userRepository;

    public CustomOidcUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String email = oidcUser.getAttribute("email");
        String name = oidcUser.getAttribute("name");
        String picture = oidcUser.getAttribute("picture");

        if (email == null || !email.toLowerCase().endsWith("@sece.ac.in")) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_email", "Access denied. Only @sece.ac.in email addresses are allowed.", null)
            );
        }

        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        if (existingUser.isEmpty()) {
            user = new User(email, name, picture);
            user = userRepository.save(user);
        } else {
            user = existingUser.get();
        }

        Set<GrantedAuthority> mappedAuthorities = new LinkedHashSet<>(oidcUser.getAuthorities());
        mappedAuthorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        String userNameAttributeName = userRequest.getClientRegistration()
                .getProviderDetails().getUserInfoEndpoint().getUserNameAttributeName();

        if (StringUtils.hasText(userNameAttributeName)) {
            return new DefaultOidcUser(mappedAuthorities, oidcUser.getIdToken(), oidcUser.getUserInfo(), userNameAttributeName);
        }
        return new DefaultOidcUser(mappedAuthorities, oidcUser.getIdToken(), oidcUser.getUserInfo());
    }
}
