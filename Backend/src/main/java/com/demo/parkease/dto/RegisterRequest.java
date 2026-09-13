package com.demo.parkease.dto;


import com.demo.parkease.entity.Role;
import lombok.Data;

@Data
public class RegisterRequest {

    private String name;
    private String email;
    private String password;
    private String phone;   // ✅ Add this
    private Role role;

}