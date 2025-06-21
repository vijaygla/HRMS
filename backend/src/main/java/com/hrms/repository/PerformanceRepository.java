package com.hrms.repository;

import com.hrms.model.Performance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PerformanceRepository extends MongoRepository<Performance, String> {
    // Custom query methods can be defined here if needed
}