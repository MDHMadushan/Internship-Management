package com.internship.management.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Document(collection = "projects")
public class Project {
    @Id
    private String id;
    private String name;
    private String description;
    private String technology;
    private String status; // PLANNING, ACTIVE, COMPLETED, ON_HOLD
    private LocalDateTime deadline;
    private List<String> assignedInternIds;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String assignedTo;
}