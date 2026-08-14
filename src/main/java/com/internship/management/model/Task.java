package com.internship.management.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "tasks")
public class Task {
    @Id
    private String id;
    private String title;
    private String description;
    private String status; // TODO, IN_PROGRESS, SUBMITTED, REVISION_REQUIRED, COMPLETED
    private String priority; // LOW, MEDIUM, HIGH, CRITICAL
    private LocalDateTime deadline;
    private String projectId;
    private String assignedTo;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}