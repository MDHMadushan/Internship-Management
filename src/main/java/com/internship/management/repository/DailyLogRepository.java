package com.internship.management.repository;

import com.internship.management.model.DailyLog;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyLogRepository extends MongoRepository<DailyLog, String> {
    List<DailyLog> findByInternId(String internId);
    List<DailyLog> findByInternIdOrderByDateDesc(String internId);
    List<DailyLog> findByDate(LocalDate date);
    List<DailyLog> findByInternIdAndDate(String internId, LocalDate date);
    List<DailyLog> findAllByOrderByDateDesc();
    long countByInternId(String internId);
}