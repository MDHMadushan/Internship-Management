package com.internship.management.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String password;
    private String fullName;
    private String role; // ADMIN or INTERN
    private boolean isActive = true;
    private String phone;
    private String department;
    private String university;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}