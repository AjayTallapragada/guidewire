package com.devtrails.backend.repository;

import com.devtrails.backend.entity.Claim;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClaimRepository extends JpaRepository<Claim, Long> {
    List<Claim> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Claim> findByEventKey(String eventKey);
}
