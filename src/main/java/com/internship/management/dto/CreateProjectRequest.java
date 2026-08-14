package com.internship.management.dto;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CreateProjectRequest {
    @NotBlank(message = "Project name is required")
    private String name;

    private String description;
    private String technology;
    private String status;

    @NotNull(message = "Deadline is required")
    private LocalDateTime deadline;

    private List<String> assignedInternIds;

    @NotBlank(message = "Created by is required")
    private String createdBy;
}