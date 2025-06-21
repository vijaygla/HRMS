package com.hrms.service;

import com.hrms.model.Performance;
import com.hrms.repository.PerformanceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PerformanceService {

    private final PerformanceRepository performanceRepository;

    @Autowired
    public PerformanceService(PerformanceRepository performanceRepository) {
        this.performanceRepository = performanceRepository;
    }

    public List<Performance> getAllPerformances() {
        return performanceRepository.findAll();
    }

    public Performance getPerformanceById(String id) {
        return performanceRepository.findById(id).orElse(null);
    }

    public Performance createPerformance(Performance performance) {
        return performanceRepository.save(performance);
    }

    public Performance updatePerformance(String id, Performance performance) {
        if (performanceRepository.existsById(id)) {
            performance.setId(id);
            return performanceRepository.save(performance);
        }
        return null;
    }

    public void deletePerformance(String id) {
        performanceRepository.deleteById(id);
    }
}