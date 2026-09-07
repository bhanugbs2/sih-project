package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.ProcessingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessingRecordRepository extends JpaRepository<ProcessingRecord, String> {
    List<ProcessingRecord> findByBatchBatchId(String batchId);
}
