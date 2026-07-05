package com.debugmate.controller;

import com.debugmate.dto.DebugRequest;
import com.debugmate.dto.ProfileRequest;
import com.debugmate.dto.ProfileResponse;
import com.debugmate.dto.SnippetRequest;
import com.debugmate.model.DebugSession;
import com.debugmate.model.SavedSnippet;
import com.debugmate.service.DebugService;
import com.debugmate.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
public class DebugController {

    @Autowired
    private DebugService debugService;

    @Autowired
    private UserService userService;

    @PostMapping("/debug")
    public ResponseEntity<DebugSession> debugCode(
            Principal principal,
            @Valid @RequestBody DebugRequest request) {
        String email = principal.getName();
        DebugSession session = debugService.createDebugSession(email, request);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/history")
    public ResponseEntity<List<DebugSession>> getHistory(Principal principal) {
        String email = principal.getName();
        List<DebugSession> history = debugService.getHistory(email);
        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/history/{id}")
    public ResponseEntity<Void> deleteHistory(Principal principal, @PathVariable String id) {
        String email = principal.getName();
        debugService.deleteSession(email, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile(Principal principal) {
        String email = principal.getName();
        ProfileResponse profile = userService.getUserProfile(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(Principal principal, @Valid @RequestBody ProfileRequest request) {
        String email = principal.getName();
        ProfileResponse profile = userService.updateUserProfile(email, request);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/save-snippet")
    public ResponseEntity<SavedSnippet> saveSnippet(Principal principal, @Valid @RequestBody SnippetRequest request) {
        String email = principal.getName();
        SavedSnippet snippet = debugService.saveSnippet(email, request);
        return ResponseEntity.ok(snippet);
    }

    @GetMapping("/snippets")
    public ResponseEntity<List<SavedSnippet>> getSnippets(Principal principal) {
        String email = principal.getName();
        List<SavedSnippet> snippets = debugService.getSnippets(email);
        return ResponseEntity.ok(snippets);
    }

    @DeleteMapping("/snippet/{id}")
    public ResponseEntity<Void> deleteSnippet(Principal principal, @PathVariable String id) {
        String email = principal.getName();
        debugService.deleteSnippet(email, id);
        return ResponseEntity.noContent().build();
    }
}
