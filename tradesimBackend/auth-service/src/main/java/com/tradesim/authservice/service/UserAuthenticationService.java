package com.tradesim.authservice.service;

import com.tradesim.authservice.Utils.JwtUtil;
import com.tradesim.authservice.dto.AuthResDTO;
import com.tradesim.authservice.exception.EmailNotFoundException;
import com.tradesim.authservice.exception.IncorrectPassword;
import com.tradesim.authservice.exception.UserAlreadyExistException;
import com.tradesim.authservice.kafka.KafkaProducerService;
import com.tradesim.authservice.model.UserEntity;
import com.tradesim.authservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserAuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder bCryptPasswordEncoder;
    private final JwtUtil jwtUtil;
    private final KafkaProducerService kafkaProducerService;


    public UserAuthenticationService(
            UserRepository userRepository1,
            PasswordEncoder bCryptPasswordEncoder1,
            JwtUtil jwtUtil1,
            KafkaProducerService kafkaProducerService1
            ){
        this.userRepository = userRepository1;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder1;
        this.jwtUtil = jwtUtil1;
        this.kafkaProducerService = kafkaProducerService1;
    }


    public AuthResDTO signUp(String name, String email, String password){
        if (userRepository.findByEmail(email).isPresent()){
            throw new UserAlreadyExistException("User Already Exist");
        }

        System.out.println(name + email + password);

        String hashedPassword = bCryptPasswordEncoder.encode(password);

        String accessToken = jwtUtil.generateAccessToken(email);
        String refreshToken = jwtUtil.generateRefreshToken(email);

        UserEntity user = new UserEntity();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(hashedPassword);
        user.setRefreshToken(refreshToken);

        userRepository.save(user);

        kafkaProducerService.sendUserCreatedEvent(email);

        return AuthResDTO.builder()
                .jwtToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }

    public AuthResDTO login(String email, String password) {
        UserEntity user = userRepository.findByEmail(email)
                        .orElseThrow(() -> new EmailNotFoundException("User not found"));
        if (!bCryptPasswordEncoder.matches(password, user.getPassword())){
            throw new IncorrectPassword("Invalid credentials");
        }

        String accessToken = jwtUtil.generateAccessToken(email);
        String refreshToken = jwtUtil.generateRefreshToken(email);

        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        return AuthResDTO.builder()
                .jwtToken(accessToken)
                .refreshToken(refreshToken)
                .build();
    }
}
