package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, String> {
    List<SensorReading> findByHiveHiveIdOrderByTimestampDesc(String hiveId);
    List<SensorReading> findByHiveHiveIdOrderByTimestampDesc(String hiveId, Pageable pageable);
    Optional<SensorReading> findFirstByHiveHiveIdOrderByTimestampDesc(String hiveId);
    List<SensorReading> findByHiveHiveIdAndTimestampBetweenOrderByTimestampDesc(String hiveId, Instant from, Instant to);
}
