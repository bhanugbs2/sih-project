package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, String> {
    List<SensorReading> findByHiveHiveIdOrderByTimestampDesc(String hiveId);
}
