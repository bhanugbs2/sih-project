package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.AIAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;

@Repository
public interface AIAlertRepository extends JpaRepository<AIAlert, String> {
    List<AIAlert> findByHiveHiveIdOrderByTimestampDesc(String hiveId);
    List<AIAlert> findByHiveHiveIdOrderByTimestampDesc(String hiveId, Pageable pageable);
    Optional<AIAlert> findFirstByHiveHiveIdOrderByTimestampDesc(String hiveId);
    List<AIAlert> findAllByOrderByTimestampDesc();
}
