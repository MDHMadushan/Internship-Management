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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    @Autowired
    private DailyLogRepository dailyLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // ========== USER MANAGEMENT ==========

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/users")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> request) {
        try {
            String email = (String) request.get("email");
            if (userRepository.existsByEmail(email)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Email already exists"));
            }

            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode((String) request.get("password")));
            user.setFullName((String) request.get("fullName"));
            user.setRole((String) request.getOrDefault("role", "INTERN"));
            user.setActive(true);
            user.setPhone((String) request.getOrDefault("phone", ""));
            user.setDepartment((String) request.getOrDefault("department", ""));
            user.setUniversity((String) request.getOrDefault("university", ""));
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());

            User savedUser = userRepository.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<?> toggleUserStatus(@PathVariable String id) {
        return userRepository.findById(id)
                .map(user -> {
                    user.setActive(!user.isActive());
                    user.setUpdatedAt(LocalDateTime.now());
                    userRepository.save(user);
                    return ResponseEntity.ok(Map.of("message", "User status updated"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (userRepository.existsById(id)) {
            userRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    // ========== GET ALL INTERNS ==========

    @GetMapping("/interns/list")
    public ResponseEntity<List<User>> getAllInterns() {
        return ResponseEntity.ok(userRepository.findByRole("INTERN"));
    }

    // ========== PROJECT MANAGEMENT ==========

    @GetMapping("/projects")
    public ResponseEntity<List<Project>> getAllProjects() {
        return ResponseEntity.ok(projectRepository.findAll());
    }

    @GetMapping("/projects/{id}")
    public ResponseEntity<Project> getProjectById(@PathVariable String id) {
        return projectRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/projects")
    public ResponseEntity<?> createProject(@RequestBody Map<String, Object> request) {
        try {
            Project project = new Project();
            project.setName((String) request.get("name"));
            project.setDescription((String) request.getOrDefault("description", ""));
            project.setTechnology((String) request.getOrDefault("technology", ""));
            project.setStatus((String) request.getOrDefault("status", "ACTIVE"));
            project.setCreatedBy((String) request.getOrDefault("createdBy", "admin"));
            project.setCreatedAt(LocalDateTime.now());
            project.setUpdatedAt(LocalDateTime.now());

            if (request.get("deadline") != null) {
                project.setDeadline(LocalDateTime.parse((String) request.get("deadline")));
            }

            project.setAssignedInternIds(new ArrayList<>());

            Project savedProject = projectRepository.save(project);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedProject);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/projects/{id}")
    public ResponseEntity<Project> updateProject(@PathVariable String id,
                                                 @RequestBody Map<String, Object> request) {
        return projectRepository.findById(id)
                .map(project -> {
                    project.setName((String) request.getOrDefault("name", project.getName()));
                    project.setDescription((String) request.getOrDefault("description", project.getDescription()));
                    project.setTechnology((String) request.getOrDefault("technology", project.getTechnology()));
                    project.setStatus((String) request.getOrDefault("status", project.getStatus()));
                    project.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(projectRepository.save(project));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/projects/{id}")
    public ResponseEntity<?> deleteProject(@PathVariable String id) {
        if (projectRepository.existsById(id)) {
            projectRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Project deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    // ========== PROJECT INTERN MANAGEMENT ==========

    @PostMapping("/projects/{projectId}/assign-interns")
    public ResponseEntity<?> assignInternsToProject(
            @PathVariable String projectId,
            @RequestBody Map<String, List<String>> request) {

        return projectRepository.findById(projectId)
                .map(project -> {
                    List<String> internIds = request.get("internIds");
                    if (project.getAssignedInternIds() == null) {
                        project.setAssignedInternIds(new ArrayList<>());
                    }
                    for (String internId : internIds) {
                        if (!project.getAssignedInternIds().contains(internId)) {
                            project.getAssignedInternIds().add(internId);
                        }
                    }
                    project.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(projectRepository.save(project));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/projects/{projectId}/remove-intern/{internId}")
    public ResponseEntity<?> removeInternFromProject(
            @PathVariable String projectId,
            @PathVariable String internId) {

        return projectRepository.findById(projectId)
                .map(project -> {
                    if (project.getAssignedInternIds() != null) {
                        project.getAssignedInternIds().remove(internId);
                        project.setUpdatedAt(LocalDateTime.now());
                        return ResponseEntity.ok(projectRepository.save(project));
                    }
                    return ResponseEntity.ok(project);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/projects/{projectId}/details")
    public ResponseEntity<?> getProjectWithInternDetails(@PathVariable String projectId) {
        return projectRepository.findById(projectId)
                .map(project -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("project", project);

                    List<String> internIds = project.getAssignedInternIds();
                    if (internIds != null && !internIds.isEmpty()) {
                        response.put("assignedInterns", userRepository.findAllById(internIds));
                    } else {
                        response.put("assignedInterns", new ArrayList<>());
                    }

                    response.put("allInterns", userRepository.findByRole("INTERN"));
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== TASK MANAGEMENT ==========

    @GetMapping("/tasks")
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskRepository.findAll());
    }

    @GetMapping("/tasks/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable String id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/tasks")
    public ResponseEntity<?> createTask(@RequestBody Map<String, Object> request) {
        try {
            System.out.println("📝 Creating task with data: " + request);

            Task task = new Task();
            task.setTitle((String) request.get("title"));
            task.setDescription((String) request.getOrDefault("description", ""));
            task.setStatus((String) request.getOrDefault("status", "TODO"));
            task.setPriority((String) request.getOrDefault("priority", "MEDIUM"));
            task.setCreatedBy((String) request.getOrDefault("createdBy", "admin"));
            task.setCreatedAt(LocalDateTime.now());
            task.setUpdatedAt(LocalDateTime.now());

            // Handle date with various formats
            if (request.get("deadline") != null) {
                String deadlineStr = (String) request.get("deadline");
                if (!deadlineStr.isEmpty()) {
                    try {
                        task.setDeadline(LocalDateTime.parse(deadlineStr,
                                DateTimeFormatter.ISO_DATE_TIME));
                    } catch (Exception e) {
                        try {
                            String datePart = deadlineStr.substring(0, 10);
                            task.setDeadline(LocalDateTime.parse(datePart + "T00:00:00"));
                        } catch (Exception e2) {
                            task.setDeadline(LocalDateTime.now().plusDays(7));
                            System.out.println("⚠️ Using fallback deadline: " + task.getDeadline());
                        }
                    }
                }
            }

            // Handle projectId
            if (request.get("projectId") != null) {
                String projectId = (String) request.get("projectId");
                if (!projectId.isEmpty()) {
                    task.setProjectId(projectId);
                }
            }

            // Handle assignedTo
            if (request.get("assignedTo") != null) {
                String assignedTo = (String) request.get("assignedTo");
                if (!assignedTo.isEmpty()) {
                    task.setAssignedTo(assignedTo);
                }
            }

            Task savedTask = taskRepository.save(task);
            System.out.println("✅ Task created with ID: " + savedTask.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);

        } catch (Exception e) {
            System.err.println("❌ Error creating task: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task task) {
        return taskRepository.findById(id)
                .map(existing -> {
                    existing.setTitle(task.getTitle());
                    existing.setDescription(task.getDescription());
                    existing.setStatus(task.getStatus());
                    existing.setPriority(task.getPriority());
                    existing.setDeadline(task.getDeadline());
                    existing.setAssignedTo(task.getAssignedTo());
                    existing.setProjectId(task.getProjectId());
                    existing.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(taskRepository.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/tasks/{id}/status")
    public ResponseEntity<?> updateTaskStatus(@PathVariable String id,
                                              @RequestBody Map<String, String> request) {
        return taskRepository.findById(id)
                .map(task -> {
                    task.setStatus(request.get("status"));
                    task.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Task deleted"));
        }
        return ResponseEntity.notFound().build();
    }

    // ========== TASK INTERN MANAGEMENT ==========

    @PutMapping("/tasks/{taskId}/assign/{internId}")
    public ResponseEntity<?> assignTaskToIntern(
            @PathVariable String taskId,
            @PathVariable String internId) {

        return taskRepository.findById(taskId)
                .map(task -> {
                    task.setAssignedTo(internId);
                    task.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/tasks/{taskId}/unassign")
    public ResponseEntity<?> unassignTask(@PathVariable String taskId) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    task.setAssignedTo(null);
                    task.setUpdatedAt(LocalDateTime.now());
                    return ResponseEntity.ok(taskRepository.save(task));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/tasks/{taskId}/details")
    public ResponseEntity<?> getTaskWithInternDetails(@PathVariable String taskId) {
        return taskRepository.findById(taskId)
                .map(task -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("task", task);

                    if (task.getAssignedTo() != null) {
                        userRepository.findById(task.getAssignedTo())
                                .ifPresent(intern -> response.put("assignedIntern", intern));
                    }

                    response.put("allInterns", userRepository.findByRole("INTERN"));

                    if (task.getProjectId() != null) {
                        projectRepository.findById(task.getProjectId())
                                .ifPresent(project -> response.put("project", project));
                    }

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ========== DAILY LOG MANAGEMENT (ADMIN) ==========

    // Get all daily logs (for admin)
    @GetMapping("/daily-logs")
    public ResponseEntity<List<DailyLog>> getAllDailyLogs() {
        List<DailyLog> logs = dailyLogRepository.findAllByOrderByDateDesc();
        return ResponseEntity.ok(logs);
    }

    // Get daily logs for a specific intern
    @GetMapping("/daily-logs/intern/{internId}")
    public ResponseEntity<List<DailyLog>> getInternDailyLogs(@PathVariable String internId) {
        List<DailyLog> logs = dailyLogRepository.findByInternIdOrderByDateDesc(internId);
        return ResponseEntity.ok(logs);
    }

    // Get daily logs for a specific date
    @GetMapping("/daily-logs/date")
    public ResponseEntity<List<DailyLog>> getDailyLogsByDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        List<DailyLog> logs = dailyLogRepository.findByDate(localDate);
        return ResponseEntity.ok(logs);
    }

    // Get daily logs with intern details
    @GetMapping("/daily-logs/with-interns")
    public ResponseEntity<?> getAllDailyLogsWithInterns() {
        List<DailyLog> logs = dailyLogRepository.findAllByOrderByDateDesc();

        List<Map<String, Object>> response = logs.stream().map(log -> {
            Map<String, Object> item = new HashMap<>();
            item.put("log", log);

            userRepository.findById(log.getInternId())
                    .ifPresent(intern -> {
                        Map<String, Object> internInfo = new HashMap<>();
                        internInfo.put("id", intern.getId());
                        internInfo.put("fullName", intern.getFullName());
                        internInfo.put("email", intern.getEmail());
                        internInfo.put("department", intern.getDepartment());
                        item.put("intern", internInfo);
                    });

            return item;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Add feedback to a daily log
    @PostMapping("/daily-logs/{logId}/feedback")
    public ResponseEntity<?> addFeedbackToDailyLog(
            @PathVariable String logId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        String email = authentication.getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return dailyLogRepository.findById(logId)
                .map(log -> {
                    log.setSupervisorFeedback(request.get("feedback"));
                    log.setFeedbackGivenBy(admin.getFullName());
                    log.setFeedbackDate(LocalDateTime.now());
                    log.setUpdatedAt(LocalDateTime.now());
                    DailyLog updatedLog = dailyLogRepository.save(log);
                    return ResponseEntity.ok(updatedLog);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get daily log statistics
    @GetMapping("/daily-logs/stats")
    public ResponseEntity<?> getDailyLogStats() {
        List<DailyLog> allLogs = dailyLogRepository.findAll();
        List<User> interns = userRepository.findByRole("INTERN");

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", allLogs.size());
        stats.put("totalInterns", interns.size());
        stats.put("internsWithLogs", allLogs.stream()
                .map(DailyLog::getInternId)
                .distinct()
                .count());
        stats.put("logsToday", dailyLogRepository.findByDate(LocalDate.now()).size());
        stats.put("logsThisWeek", allLogs.stream()
                .filter(log -> log.getDate().isAfter(LocalDate.now().minusDays(7)))
                .count());

        // Logs per intern
        Map<String, Long> logsPerIntern = allLogs.stream()
                .collect(Collectors.groupingBy(DailyLog::getInternId, Collectors.counting()));
        stats.put("logsPerIntern", logsPerIntern);

        // Feedback statistics
        long logsWithFeedback = allLogs.stream()
                .filter(log -> log.getSupervisorFeedback() != null && !log.getSupervisorFeedback().isEmpty())
                .count();
        stats.put("logsWithFeedback", logsWithFeedback);
        stats.put("feedbackPercentage", allLogs.isEmpty() ? 0 :
                (logsWithFeedback * 100) / allLogs.size());

        return ResponseEntity.ok(stats);
    }

    // Get daily log with intern details by ID
    @GetMapping("/daily-logs/{logId}/details")
    public ResponseEntity<?> getDailyLogWithInternDetails(@PathVariable String logId) {
        return dailyLogRepository.findById(logId)
                .map(log -> {
                    Map<String, Object> response = new HashMap<>();
                    response.put("log", log);

                    userRepository.findById(log.getInternId())
                            .ifPresent(intern -> {
                                Map<String, Object> internInfo = new HashMap<>();
                                internInfo.put("id", intern.getId());
                                internInfo.put("fullName", intern.getFullName());
                                internInfo.put("email", intern.getEmail());
                                internInfo.put("department", intern.getDepartment());
                                response.put("intern", internInfo);
                            });

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Get logs summary by date range
    @GetMapping("/daily-logs/summary")
    public ResponseEntity<?> getLogsSummary(
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {

        List<DailyLog> allLogs = dailyLogRepository.findAll();

        LocalDate start = startDate != null ? LocalDate.parse(startDate) : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? LocalDate.parse(endDate) : LocalDate.now();

        List<DailyLog> filteredLogs = allLogs.stream()
                .filter(log -> !log.getDate().isBefore(start) && !log.getDate().isAfter(end))
                .collect(Collectors.toList());

        Map<String, Object> summary = new HashMap<>();
        summary.put("startDate", start);
        summary.put("endDate", end);
        summary.put("totalLogs", filteredLogs.size());
        summary.put("totalInterns", filteredLogs.stream()
                .map(DailyLog::getInternId)
                .distinct()
                .count());
        summary.put("totalHours", filteredLogs.stream()
                .mapToInt(DailyLog::getHoursWorked)
                .sum());

        // Group by intern
        Map<String, List<DailyLog>> logsByIntern = filteredLogs.stream()
                .collect(Collectors.groupingBy(DailyLog::getInternId));

        Map<String, Object> internSummaries = new HashMap<>();
        logsByIntern.forEach((internId, logs) -> {
            userRepository.findById(internId).ifPresent(intern -> {
                Map<String, Object> internSummary = new HashMap<>();
                internSummary.put("name", intern.getFullName());
                internSummary.put("email", intern.getEmail());
                internSummary.put("totalLogs", logs.size());
                internSummary.put("totalHours", logs.stream().mapToInt(DailyLog::getHoursWorked).sum());
                internSummary.put("avgHours", logs.stream().mapToInt(DailyLog::getHoursWorked).average().orElse(0));
                internSummaries.put(intern.getFullName(), internSummary);
            });
        });

        summary.put("internSummaries", internSummaries);

        return ResponseEntity.ok(summary);
    }
}