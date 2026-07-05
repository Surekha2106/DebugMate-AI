package com.debugmate.service;

import com.debugmate.dto.DebugRequest;
import com.debugmate.dto.SnippetRequest;
import com.debugmate.exception.ResourceNotFoundException;
import com.debugmate.exception.UnauthorizedException;
import com.debugmate.model.AiResponse;
import com.debugmate.model.DebugSession;
import com.debugmate.model.SavedSnippet;
import com.debugmate.model.User;
import com.debugmate.repository.DebugSessionRepository;
import com.debugmate.repository.SavedSnippetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;

@Service
public class DebugService {

    @Autowired
    private DebugSessionRepository debugSessionRepository;

    @Autowired
    private SavedSnippetRepository savedSnippetRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private GeminiService geminiService;

    public DebugSession createDebugSession(String email, DebugRequest request) {
        User user = userService.getUserByEmail(email);

        AiResponse aiResponse = geminiService.analyzeCode(request.getCode(), request.getLanguage());

        DebugSession session = new DebugSession();
        session.setUserId(user.getId());
        session.setLanguage(request.getLanguage());
        session.setInputCode(request.getCode());
        session.setAiResponse(aiResponse);
        session.setCreatedDate(Instant.now());

        return debugSessionRepository.save(session);
    }

    public List<DebugSession> getHistory(String email) {
        User user = userService.getUserByEmail(email);
        return debugSessionRepository.findByUserIdOrderByCreatedDateDesc(user.getId());
    }

    public void deleteSession(String email, String sessionId) {
        User user = userService.getUserByEmail(email);
        DebugSession session = debugSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Debug session not found"));

        if (!session.getUserId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this session");
        }

        debugSessionRepository.delete(session);
    }

    public SavedSnippet saveSnippet(String email, SnippetRequest request) {
        User user = userService.getUserByEmail(email);

        SavedSnippet snippet = new SavedSnippet();
        snippet.setUserId(user.getId());
        snippet.setTitle(request.getTitle());
        snippet.setCode(request.getCode());
        snippet.setLanguage(request.getLanguage());
        snippet.setCreatedDate(Instant.now());

        return savedSnippetRepository.save(snippet);
    }

    public List<SavedSnippet> getSnippets(String email) {
        User user = userService.getUserByEmail(email);
        return savedSnippetRepository.findByUserIdOrderByCreatedDateDesc(user.getId());
    }

    public void deleteSnippet(String email, String snippetId) {
        User user = userService.getUserByEmail(email);
        SavedSnippet snippet = savedSnippetRepository.findById(snippetId)
                .orElseThrow(() -> new ResourceNotFoundException("Snippet not found"));

        if (!snippet.getUserId().equals(user.getId())) {
            throw new UnauthorizedException("You are not authorized to delete this snippet");
        }

        savedSnippetRepository.delete(snippet);
    }
}
