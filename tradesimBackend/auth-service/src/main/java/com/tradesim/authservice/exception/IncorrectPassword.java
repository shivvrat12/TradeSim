package com.tradesim.authservice.exception;

public class IncorrectPassword extends RuntimeException{

    public IncorrectPassword(String message){
        super(message);
    }

    public IncorrectPassword(String message, Throwable reason){
        super(message, reason);
    }

}
