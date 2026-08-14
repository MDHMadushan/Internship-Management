package com.internship.management.repository;

import com.internship.management.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByAssignedTo(String internId);
    List<Task> findByStatus(String status);
    List<Task> findByProjectId(String projectId);
}