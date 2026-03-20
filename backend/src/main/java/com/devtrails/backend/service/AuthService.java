package com.devtrails.backend.service;

import com.devtrails.backend.dto.AuthRequest;
import com.devtrails.backend.dto.AuthResponse;
import com.devtrails.backend.dto.RegisterRequest;
import com.devtrails.backend.entity.AppUser;
import com.devtrails.backend.entity.UserRole;
import com.devtrails.backend.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository appUserRepository;

    public AuthResponse register(RegisterRequest request) {
        appUserRepository.findByPhone(request.getPhone()).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Phone already registered");
        });

        AppUser user = new AppUser();
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setCity(request.getCity());
        user.setZone(request.getZone());
        user.setDeliveryType(request.getDeliveryType());
        user.setAverageDailyEarnings(request.getAverageDailyEarnings());
        user.setPassword(request.getPassword());
        user.setRole(UserRole.USER);
        return toResponse(appUserRepository.save(user));
    }

    public AuthResponse login(AuthRequest request) {
        AppUser user = appUserRepository.findByPhone(request.getPhone())
            .filter(item -> item.getPassword().equals(request.getPassword()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        return toResponse(user);
    }

    public AppUser getUser(Long userId) {
        return appUserRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public AuthResponse toResponse(AppUser user) {
        return AuthResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .phone(user.getPhone())
            .city(user.getCity())
            .zone(user.getZone())
            .deliveryType(user.getDeliveryType())
            .averageDailyEarnings(user.getAverageDailyEarnings())
            .role(user.getRole())
            .build();
    }
}
