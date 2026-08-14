package com.internship.management.controller;

import com.internship.management.model.DailyLog;
import com.internship.management.model.Project;
import com.internship.management.model.Task;
import com.internship.management.model.User;
import com.internship.management.repository.DailyLogRepository;
import com.internship.management.repository.ProjectRepository;
import com.internship.management.repository.TaskRepository;
import com.internship.management.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/intern")
@CrossOrigin(origins = "http://localhost:3000")
public class InternController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private DailyLogRepository dailyLogRepository;

    // ========== GET INTERN PROFILE ==========
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", intern.getId());
            profile.put("fullName", intern.getFullName());
            profile.put("email", intern.getEmail());
            profile.put("department", intern.getDepartment());
            profile.put("university", intern.getUniversity());
            profile.put("phone", intern.getPhone());
            profile.put("joinedDate", intern.getCreatedAt());

            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to get profile: " + e.getMessage()));
        }
    }

    // ========== GET INTERN'S PROJECTS ==========
    @GetMapping("/projects")
    public ResponseEntity<?> getMyProjects(Authentication authentication) {
        try {
            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Project> projects = projectRepository.findByAssignedInternIdsContaining(intern.getId());
            return ResponseEntity.ok(projects);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch projects: " + e.getMessage()));
        }
    }

    // ========== GET INTERN'S TASKS ==========
    @GetMapping("/tasks")
    public ResponseEntity<?> getMyTasks(Authentication authentication) {
        try {
            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskRepository.findByAssignedTo(intern.getId());
            return ResponseEntity.ok(tasks);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch tasks: " + e.getMessage()));
        }
    }

    // ========== GET INTERN'S TASKS WITH PROJECT DETAILS ==========
    @GetMapping("/tasks-with-projects")
    public ResponseEntity<?> getMyTasksWithProjects(Authentication authentication) {
        try {
            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskRepository.findByAssignedTo(intern.getId());
            List<Project> projects = projectRepository.findByAssignedInternIdsContaining(intern.getId());

            Map<String, Object> response = new HashMap<>();
            response.put("tasks", tasks);
            response.put("projects", projects);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch tasks with projects: " + e.getMessage()));
        }
    }

    // ========== UPDATE TASK STATUS ==========
    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return taskRepository.findById(id)
                    .map(task -> {
                        if (!task.getAssignedTo().equals(intern.getId())) {
                            return ResponseEntity.status(403)
                                    .body(Map.of("message", "You are not assigned to this task"));
                        }

                        String newStatus = request.get("status");
                        if (newStatus.equals("IN_PROGRESS") ||
                                newStatus.equals("SUBMITTED") ||
                                newStatus.equals("TODO") ||
                                newStatus.equals("COMPLETED")) {
                            task.setStatus(newStatus);
                            task.setUpdatedAt(LocalDateTime.now());
                            return ResponseEntity.ok(taskRepository.save(task));
                        }
                        return ResponseEntity.badRequest()
                                .body(Map.of("message", "Invalid status update"));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to update task status: " + e.getMessage()));
        }
    }

    // ========== SUBMIT DAILY LOG ==========
    @PostMapping("/daily-logs")
    public ResponseEntity<?> createDailyLog(@RequestBody DailyLog dailyLog,
                                            Authentication authentication) {
        try {
            System.out.println("📝 Creating daily log for intern...");

            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("👤 Intern: " + intern.getFullName() + " (" + intern.getId() + ")");

            // Check if log already exists for today
            List<DailyLog> existingLogs = dailyLogRepository.findByInternIdAndDate(
                    intern.getId(), LocalDate.now());

            if (!existingLogs.isEmpty()) {
                System.out.println("⚠️ Log already exists for today");
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "You have already submitted a log for today"));
            }

            // Validate required fields
            if (dailyLog.getCompletedWork() == null || dailyLog.getCompletedWork().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Completed work is required"));
            }
            if (dailyLog.getCurrentWork() == null || dailyLog.getCurrentWork().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Current work is required"));
            }
            if (dailyLog.getNextDayPlan() == null || dailyLog.getNextDayPlan().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Next day plan is required"));
            }
            if (dailyLog.getHoursWorked() == null || dailyLog.getHoursWorked() <= 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Valid hours worked is required"));
            }

            dailyLog.setInternId(intern.getId());
            dailyLog.setDate(LocalDate.now());
            dailyLog.setCreatedAt(LocalDateTime.now());
            dailyLog.setUpdatedAt(LocalDateTime.now());

            DailyLog savedLog = dailyLogRepository.save(dailyLog);
            System.out.println("✅ Daily log created with ID: " + savedLog.getId());

            return ResponseEntity.ok(savedLog);

        } catch (Exception e) {
            System.err.println("❌ Error creating daily log: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to submit log: " + e.getMessage()));
        }
    }

    // ========== GET MY DAILY LOGS ==========
    @GetMapping("/daily-logs")
    public ResponseEntity<?> getMyDailyLogs(Authentication authentication) {
        try {
            System.out.println("📤 Fetching daily logs...");

            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("👤 Intern ID: " + intern.getId());

            List<DailyLog> logs = dailyLogRepository.findByInternIdOrderByDateDesc(intern.getId());
            System.out.println("✅ Found " + logs.size() + " logs");

            return ResponseEntity.ok(logs);
        } catch (Exception e) {
            System.err.println("❌ Error fetching logs: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch logs: " + e.getMessage()));
        }
    }

    // ========== GET TODAY'S LOG STATUS ==========
    @GetMapping("/daily-logs/today")
    public ResponseEntity<?> getTodayLogStatus(Authentication authentication) {
        try {
            System.out.println("📤 Checking today's log status...");

            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            System.out.println("👤 Intern ID: " + intern.getId());

            List<DailyLog> todayLogs = dailyLogRepository.findByInternIdAndDate(
                    intern.getId(), LocalDate.now());

            System.out.println("📊 Today's logs found: " + todayLogs.size());

            Map<String, Object> response = new HashMap<>();
            response.put("hasSubmitted", !todayLogs.isEmpty());
            if (!todayLogs.isEmpty()) {
                response.put("log", todayLogs.get(0));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error checking today's log: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to check today's log: " + e.getMessage()));
        }
    }

    // ========== DELETE DAILY LOG ==========
    @DeleteMapping("/daily-logs/{logId}")
    public ResponseEntity<?> deleteDailyLog(
            @PathVariable String logId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return dailyLogRepository.findById(logId)
                    .map(log -> {
                        if (!log.getInternId().equals(intern.getId())) {
                            return ResponseEntity.status(403)
                                    .body(Map.of("message", "You can only delete your own logs"));
                        }

                        dailyLogRepository.deleteById(logId);
                        return ResponseEntity.ok(Map.of("message", "Log deleted successfully"));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to delete log: " + e.getMessage()));
        }
    }

    // ========== GET DASHBOARD STATS FOR INTERN ==========
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats(Authentication authentication) {
        try {
            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            List<Task> tasks = taskRepository.findByAssignedTo(intern.getId());
            List<Project> projects = projectRepository.findByAssignedInternIdsContaining(intern.getId());
            List<DailyLog> logs = dailyLogRepository.findByInternId(intern.getId());

            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTasks", tasks.size());
            stats.put("completedTasks", tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count());
            stats.put("pendingTasks", tasks.stream().filter(t ->
                    "TODO".equals(t.getStatus()) || "IN_PROGRESS".equals(t.getStatus())).count());
            stats.put("totalProjects", projects.size());
            stats.put("activeProjects", projects.stream().filter(p -> "ACTIVE".equals(p.getStatus())).count());
            stats.put("totalLogs", logs.size());
            stats.put("logsThisMonth", logs.stream()
                    .filter(log -> log.getDate().getMonthValue() == LocalDate.now().getMonthValue())
                    .count());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch dashboard stats: " + e.getMessage()));
        }
    }

    // ========== GET TASK BY ID ==========
    @GetMapping("/tasks/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable String id, Authentication authentication) {
        try {
            String email = authentication.getName();
            User intern = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            return taskRepository.findById(id)
                    .map(task -> {
                        if (!task.getAssignedTo().equals(intern.getId())) {
                            return ResponseEntity.status(403)
                                    .body(Map.of("message", "You are not assigned to this task"));
                        }
                        return ResponseEntity.ok(task);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to fetch task: " + e.getMessage()));
        }
    }
}