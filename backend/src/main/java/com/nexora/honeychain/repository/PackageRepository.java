package com.nexora.honeychain.repository;

import com.nexora.honeychain.model.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PackageRepository extends JpaRepository<Package, String> {
    Optional<Package> findByPackageId(String packageId);
    List<Package> findByBatchBatchId(String batchId);
}
