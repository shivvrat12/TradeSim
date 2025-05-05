package com.tradesim.authservice.exception;

import com.tradesim.authservice.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(UserAlreadyExistException.class)
    public ResponseEntity<ErrorResponse> handleUserExists(UserAlreadyExistException exception){
        ErrorResponse error = new ErrorResponse("EMAIL_ALREADY_EXISTS", exception.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(Exception.class)
    public  ResponseEntity<ErrorResponse> handleOther(Exception exception){
        ErrorResponse error = new ErrorResponse("INTERNAL_ERROR", exception.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotFound(EmailNotFoundException exception){
        ErrorResponse error = new ErrorResponse("EMAIL_NOT_FOUND", exception.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(IncorrectPassword.class)
    public ResponseEntity<ErrorResponse> handleIncorrectPassword(IncorrectPassword exception){
        ErrorResponse error = new ErrorResponse("INCORRECT_PASSWORD", exception.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

}
