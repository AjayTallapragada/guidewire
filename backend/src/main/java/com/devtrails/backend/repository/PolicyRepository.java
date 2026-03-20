package com.devtrails.backend.repository;

import com.devtrails.backend.entity.Policy;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PolicyRepository extends JpaRepository<Policy, Long> {
    List<Policy> findByUserId(Long userId);
    Optional<Policy> findFirstByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);
    List<Policy> findByActiveTrue();
}
