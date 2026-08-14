package com.internship.management.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "Task title is required")
    private String title;

    private String description;

    @NotBlank(message = "Priority is required")
    private String priority;

    @NotNull(message = "Deadline is required")
    private LocalDateTime deadline;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Assigned to is required")
    private String assignedTo;

    @NotBlank(message = "Created by is required")
    private String createdBy;
}