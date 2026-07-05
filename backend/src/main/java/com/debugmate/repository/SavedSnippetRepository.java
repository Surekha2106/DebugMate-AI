package com.debugmate.repository;

import com.debugmate.model.SavedSnippet;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedSnippetRepository extends JpaRepository<SavedSnippet, String> {
    List<SavedSnippet> findByUserIdOrderByCreatedDateDesc(String userId);
}
