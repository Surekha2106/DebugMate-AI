package com.debugmate.repository;

import com.debugmate.model.DebugSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DebugSessionRepository extends JpaRepository<DebugSession, String> {
    List<DebugSession> findByUserIdOrderByCreatedDateDesc(String userId);
}
