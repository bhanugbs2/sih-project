package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.Hive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HiveRepository extends JpaRepository<Hive, String> {
    Optional<Hive> findByHiveId(String hiveId);
    boolean existsByHiveId(String hiveId);
    List<Hive> findByFarmFarmId(String farmId);
}
