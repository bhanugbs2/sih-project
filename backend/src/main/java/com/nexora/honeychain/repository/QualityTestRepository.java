package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.QualityTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QualityTestRepository extends JpaRepository<QualityTest, String> {
    List<QualityTest> findByBatchBatchId(String batchId);
}
