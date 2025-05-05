package com.tradesim.tradeservice.controller;

import com.tradesim.tradeservice.dto.BuyCryptoReq;
import com.tradesim.tradeservice.dto.SellCryptoReq;
import com.tradesim.tradeservice.dto.TradeRes;
import com.tradesim.tradeservice.service.TradeService;
import com.tradesim.tradeservice.utils.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trade")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TradeController {

    private final TradeService tradeService;
    private final JwtUtils jwtUtils;

    @PostMapping("/buy")
    public ResponseEntity<TradeRes> buyCrypto(
            @RequestHeader("Authorization") String token,
            @RequestBody BuyCryptoReq req) {

        String jwtToken = token.substring(7);

        if (!jwtUtils.isValidToken(jwtToken)){
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        String email = jwtUtils.extractEmail(jwtToken);
        System.out.println("email is:" + email + "\nAnd token is :" + token + "\nAfter cutout:" + jwtToken);

        return tradeService.buyCrypto(email,req.getSymbol(),req.getPrice(),req.getQuantity());
    }

    @PostMapping("/sell")
    public ResponseEntity<TradeRes> sellCrypto(
            @RequestHeader("Authorization") String token,
            @RequestBody SellCryptoReq req) {
        String jwtToken = token.substring(7);

        if (!jwtUtils.isValidToken(jwtToken)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        String email = jwtUtils.extractEmail(jwtToken);
        System.out.println("email is:" + email + "\nAnd token is :" + token + "\nAfter cutout:" + jwtToken);

        return tradeService.sellCrypto(email,req.getSymbol(),req.getPrice(),req.getQuantity());
    }
}
