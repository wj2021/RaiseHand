package edu.nju.raisehand.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(value = ConstraintViolationException.class)
    public ResponseEntity<String> constraintViolationExceptionHandler(ConstraintViolationException e) {
        return ResponseEntity.badRequest().body(e.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessageTemplate)
                .findFirst()
                .orElse(e.getMessage())
        );
    }
}
