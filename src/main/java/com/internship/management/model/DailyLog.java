package com.internship.management.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "daily_logs")
public class DailyLog {
    @Id
    private String id;
    private String internId;
    private LocalDate date;
    private String completedWork;
    private String currentWork;
    private String challenges;
    private Integer hoursWorked;
    private String nextDayPlan;
    private String supervisorFeedback;
    private String feedbackGivenBy;
    private LocalDateTime feedbackDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}