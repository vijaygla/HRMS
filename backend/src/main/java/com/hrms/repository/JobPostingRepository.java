package com.hrms.repository;

import com.hrms.model.JobPosting;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobPostingRepository extends MongoRepository<JobPosting, String> {
    List<JobPosting> findByStatus(String status);

    List<JobPosting> findByDepartment(String department);

    List<JobPosting> findByEmploymentType(String employmentType);

    List<JobPosting> findByPostedBy(String postedBy);
}
