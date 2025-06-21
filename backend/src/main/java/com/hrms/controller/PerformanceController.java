import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.hrms.model.Performance;
import com.hrms.service.PerformanceService;

import java.util.List;

@RestController
@RequestMapping("/api/performance")
public class PerformanceController {

    @Autowired
    private PerformanceService performanceService;

    @GetMapping
    public ResponseEntity<List<Performance>> getAllPerformances() {
        List<Performance> performances = performanceService.getAllPerformances();
        return ResponseEntity.ok(performances);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Performance> getPerformanceById(@PathVariable String id) {
        Performance performance = performanceService.getPerformanceById(id);
        return ResponseEntity.ok(performance);
    }

    @PostMapping
    public ResponseEntity<Performance> createPerformance(@RequestBody Performance performance) {
        Performance createdPerformance = performanceService.createPerformance(performance);
        return ResponseEntity.status(201).body(createdPerformance);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Performance> updatePerformance(@PathVariable String id, @RequestBody Performance performance) {
        Performance updatedPerformance = performanceService.updatePerformance(id, performance);
        return ResponseEntity.ok(updatedPerformance);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePerformance(@PathVariable String id) {
        performanceService.deletePerformance(id);
        return ResponseEntity.noContent().build();
    }
}