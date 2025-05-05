package com.tradesim.authservice.Utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    public String generateToken(String email, long expirationMillis){
        return Jwts.builder()
                .setSubject(email)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateAccessToken(String email){
        return generateToken(email, 1000 * 60 * 10); // ye apna 10 mint tak rahega ⚠️
    }

    public String generateRefreshToken(String email){
        return generateToken(email, 1000 * 60 * 60 * 24 * 7); // ye 7 dino tak boom baam machayega 😁
    }

    public String extractEmail(String token){
        return Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    public boolean validateToken(String token){
        try {
            extractEmail(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
