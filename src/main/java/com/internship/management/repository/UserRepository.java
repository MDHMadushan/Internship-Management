package com.internship.management.repository;

import com.internship.management.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    // Find user by email (for login)
    Optional<User> findByEmail(String email);

    // Find users by role (ADMIN or INTERN)
    List<User> findByRole(String role);

    // Find users who are active
    List<User> findByIsActiveTrue();

    // Check if email exists (for registration)
    boolean existsByEmail(String email);

    // ADD THIS METHOD - Find users by role and active status
    List<User> findByRoleAndIsActiveTrue(String role);
}