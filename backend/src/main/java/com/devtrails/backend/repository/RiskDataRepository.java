package com.devtrails.backend.repository;

import com.devtrails.backend.entity.RiskData;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RiskDataRepository extends JpaRepository<RiskData, Long> {
    Optional<RiskData> findByCityAndZone(String city, String zone);
}
