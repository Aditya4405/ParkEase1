package com.demo.parkease.dto;


import com.demo.parkease.entity.Role;
import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
    private Role role;
}

