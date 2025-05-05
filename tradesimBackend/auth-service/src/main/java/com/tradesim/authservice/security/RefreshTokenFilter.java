package com.tradesim.authservice.security;

import com.tradesim.authservice.Utils.JwtUtil;
import com.tradesim.authservice.service.UserAuthenticationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RefreshTokenFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;


    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String refreshToken = request.getHeader("refresh-token");

        if (refreshToken != null){
            if (jwtUtil.validateToken(refreshToken)){
                String email = jwtUtil.extractEmail(refreshToken);
                String newAccessToken = jwtUtil.generateAccessToken(email);
                response.setHeader("jwtToken",newAccessToken);
            }else {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.getWriter().write("Invalid refresh token, Please log in again");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
