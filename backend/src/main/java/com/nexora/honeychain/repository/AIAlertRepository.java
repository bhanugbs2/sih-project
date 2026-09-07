package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.AIAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AIAlertRepository extends JpaRepository<AIAlert, String> {
    List<AIAlert> findByHiveHiveIdOrderByTimestampDesc(String hiveId);
}
