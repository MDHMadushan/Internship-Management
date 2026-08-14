package com.internship.management.controller;

import com.internship.management.model.Task;
import com.internship.management.model.User;
import com.internship.management.repository.ProjectRepository;
import com.internship.management.repository.TaskRepository;
import com.internship.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
public class DashboardController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Active interns
        List<User> activeInterns = userRepository.findByRoleAndIsActiveTrue("INTERN");
        stats.put("activeInterns", activeInterns.size());

        // Active projects
        List<com.internship.management.model.Project> activeProjects =
                projectRepository.findByStatus("ACTIVE");
        stats.put("activeProjects", activeProjects.size());

        // Pending tasks
        List<Task> todoTasks = taskRepository.findByStatus("TODO");
        List<Task> inProgressTasks = taskRepository.findByStatus("IN_PROGRESS");
        stats.put("pendingTasks", todoTasks.size() + inProgressTasks.size());

        // Completed tasks
        List<Task> completedTasks = taskRepository.findByStatus("COMPLETED");
        stats.put("completedTasks", completedTasks.size());

        // Overdue tasks
        List<Task> allTasks = taskRepository.findAll();
        long overdueTasks = allTasks.stream()
                .filter(task -> task.getDeadline() != null &&
                        task.getDeadline().isBefore(LocalDateTime.now()) &&
                        !task.getStatus().equals("COMPLETED"))
                .count();
        stats.put("overdueTasks", overdueTasks);

        // Recent activity - latest 5 tasks
        List<Task> recentTasks = taskRepository.findAll();
        stats.put("recentActivity", recentTasks.stream()
                .limit(5)
                .map(task -> Map.of(
                        "title", task.getTitle(),
                        "status", task.getStatus(),
                        "updatedAt", task.getUpdatedAt()
                ))
                .toList());

        return ResponseEntity.ok(stats);
    }
}