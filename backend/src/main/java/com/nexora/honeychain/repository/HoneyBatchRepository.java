package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.HoneyBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HoneyBatchRepository extends JpaRepository<HoneyBatch, String> {
    Optional<HoneyBatch> findByBatchCode(String batchCode);
}
