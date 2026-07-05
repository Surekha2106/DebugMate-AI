package com.debugmate.service;

import com.debugmate.dto.AuthResponse;
import com.debugmate.dto.LoginRequest;
import com.debugmate.dto.ProfileRequest;
import com.debugmate.dto.ProfileResponse;
import com.debugmate.dto.SignupRequest;
import com.debugmate.exception.BadRequestException;
import com.debugmate.exception.ResourceNotFoundException;
import com.debugmate.model.User;
import com.debugmate.repository.UserRepository;
import com.debugmate.config.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.ArrayList;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                user.getPassword(),
                new ArrayList<>()
        );
    }

    public AuthResponse registerUser(SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            throw new BadRequestException("Email is already registered!");
        }

        User user = new User();
        user.setName(signupRequest.getName());
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        user.setCreatedDate(Instant.now());

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName());
    }

    public AuthResponse loginUser(LoginRequest loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new BadRequestException("Invalid email or password!"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password!");
        }

        String token = tokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getName());
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
    }

    public ProfileResponse getUserProfile(String email) {
        User user = getUserByEmail(email);
        return new ProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedDate());
    }

    public ProfileResponse updateUserProfile(String email, ProfileRequest profileRequest) {
        User user = getUserByEmail(email);

        // Check if email changed and is taken
        if (!user.getEmail().equalsIgnoreCase(profileRequest.getEmail())) {
            if (userRepository.existsByEmail(profileRequest.getEmail())) {
                throw new BadRequestException("Email is already taken!");
            }
            user.setEmail(profileRequest.getEmail());
        }

        user.setName(profileRequest.getName());

        // Update password if requested
        if (profileRequest.getCurrentPassword() != null && !profileRequest.getCurrentPassword().isEmpty()
                && profileRequest.getNewPassword() != null && !profileRequest.getNewPassword().isEmpty()) {
            if (!passwordEncoder.matches(profileRequest.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password verification failed!");
            }
            user.setPassword(passwordEncoder.encode(profileRequest.getNewPassword()));
        }

        userRepository.save(user);

        return new ProfileResponse(user.getId(), user.getName(), user.getEmail(), user.getCreatedDate());
    }
}
