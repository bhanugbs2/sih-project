package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.Farm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmRepository extends JpaRepository<Farm, String> {
    Optional<Farm> findByFarmId(String farmId);
}
