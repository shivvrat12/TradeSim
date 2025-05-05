package com.tradesim.authservice.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthResDTO {
    private String refreshToken;
    private String jwtToken;
}
