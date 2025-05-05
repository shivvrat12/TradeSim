package com.tradesim.authservice.controller;

import com.tradesim.authservice.Utils.JwtUtil;
import com.tradesim.authservice.dto.LoginReqDTO;
import com.tradesim.authservice.dto.SignUpReqDTO;
import com.tradesim.authservice.dto.AuthResDTO;
import com.tradesim.authservice.service.UserAuthenticationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth/v1")

public class AuthController {

    private final UserAuthenticationService userAuthenticationService;
    private final JwtUtil jwtUtil;

    public AuthController(UserAuthenticationService userAuthenticationService1, JwtUtil jwtUtil1){
        this.userAuthenticationService = userAuthenticationService1;
        this.jwtUtil = jwtUtil1;
    }

    @PostMapping("/signup")
    public AuthResDTO signup(@RequestBody SignUpReqDTO req){
        return userAuthenticationService.signUp(
                req.getName(),
                req.getEmail(),
                req.getPassword()
        );
    }

    @PostMapping("/login")
    public AuthResDTO login(@RequestBody LoginReqDTO req){
        return userAuthenticationService.login(
                req.getEmail(),
                req.getPassword()
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Refresh token is required");
        }

        try {
            if (jwtUtil.validateToken(refreshToken)) {
                String email = jwtUtil.extractEmail(refreshToken);
                String newAccessToken = jwtUtil.generateAccessToken(email);
                return ResponseEntity.ok(Map.of("accessToken", newAccessToken));
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid refresh token");
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token expired or invalid");
        }
    }
}
