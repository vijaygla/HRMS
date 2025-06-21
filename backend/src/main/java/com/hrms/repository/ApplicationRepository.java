package com.hrms.repository;

import com.hrms.model.Application;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationRepository extends MongoRepository<Application, String> {
    // Custom query methods can be defined here if needed
}