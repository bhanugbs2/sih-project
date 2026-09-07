package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.TraceabilityEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TraceabilityEventRepository extends JpaRepository<TraceabilityEvent, String> {
    List<TraceabilityEvent> findByBatchBatchId(String batchId);
    List<TraceabilityEvent> findByPackageEntityPackageId(String packageId);
}
