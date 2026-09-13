package com.demo.parkease.controller;

import com.demo.parkease.dto.ChatRequest;
import com.demo.parkease.dto.ChatResponse;
import com.demo.parkease.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * REST controller for the AI chatbot.
 *
 * POST /api/chat  — accepts {message, userId}
 *
 * Maintains per-user conversation history in memory so the LLM can
 * handle follow-up questions like "Book it for 2 hours" or "What about tomorrow?"
 * History is capped at 20 messages per user (10 pairs) to avoid exceeding token limits.
 */
@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatbotService chatbotService;

    /**
     * In-memory conversation store.
     * Key = userId, Value = list of {role, content} maps.
     * In production, consider moving this to Redis or a database table.
     */
    private final Map<Long, List<Map<String, String>>> conversationStore =
            new ConcurrentHashMap<>();

    private static final int MAX_HISTORY = 20; // 10 user + 10 assistant messages

    public ChatController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {

        Long   userId  = request.getUserId();
        String message = request.getMessage();

        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(ChatResponse.builder().reply("Please enter a message.").build());
        }

        // ── Get or create conversation history ──────────────────────────────
        List<Map<String, String>> history =
                conversationStore.computeIfAbsent(userId, k -> new ArrayList<>());

        // ── Call the AI service ──────────────────────────────────────────────
        ChatResponse response = chatbotService.processMessage(message, userId, history);

        // ── Append to conversation history ───────────────────────────────────
        history.add(Map.of("role", "user",      "content", message));
        history.add(Map.of("role", "assistant",  "content", response.getReply()));

        // Trim history to avoid token overflow
        while (history.size() > MAX_HISTORY) {
            history.remove(0);
        }

        return ResponseEntity.ok(response);
    }

    /** Optional: clear conversation history for a user */
    @DeleteMapping("/history/{userId}")
    public ResponseEntity<Void> clearHistory(@PathVariable("userId") Long userId) {
        conversationStore.remove(userId);
        return ResponseEntity.noContent().build();
    }
}
