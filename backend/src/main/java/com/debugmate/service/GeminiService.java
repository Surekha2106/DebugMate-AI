package com.debugmate.service;

import com.debugmate.model.AiResponse;
import com.debugmate.model.ComplexityAnalysis;
import com.debugmate.model.DetectedError;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.api-url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AiResponse analyzeCode(String code, String language) {
        String keyToUse = this.apiKey;
        if (keyToUse == null || keyToUse.trim().isEmpty() || keyToUse.startsWith("YOUR_")) {
            return generateFallbackMockResponse(code, language);
        }

        try {
            String prompt = constructPrompt(code, language);
            
            // Build Gemini Request Payload
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentMap = new HashMap<>();
            List<Map<String, Object>> parts = new ArrayList<>();
            Map<String, Object> partMap = new HashMap<>();
            
            partMap.put("text", prompt);
            parts.add(partMap);
            contentMap.put("parts", parts);
            contents.add(contentMap);
            requestBody.put("contents", contents);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            String url = apiUrl + "?key=" + keyToUse;
            
            String rawResponse = restTemplate.postForObject(url, entity, String.class);
            return parseGeminiResponse(rawResponse);
        } catch (Exception e) {
            System.err.println("Error calling Gemini API: " + e.getMessage());
            return generateFallbackMockResponse(code, language);
        }
    }

    private String constructPrompt(String code, String language) {
        return "You are an expert software debugging assistant. Analyze the following code.\n" +
                "Language: " + language + "\n" +
                "Code:\n" + code + "\n\n" +
                "You MUST return a JSON object (and ONLY JSON, no markdown wrappers, no ```json formatting) matching this exact schema:\n" +
                "{\n" +
                "  \"summary\": \"High level description of the issues found\",\n" +
                "  \"detectedErrors\": [\n" +
                "    {\n" +
                "      \"line\": 12,\n" +
                "      \"error\": \"SyntaxError or LogicalError detail\",\n" +
                "      \"explanation\": \"Beginner-friendly explanation of why it failed\",\n" +
                "      \"suggestion\": \"How to fix it\"\n" +
                "    }\n" +
                "  ],\n" +
                "  \"optimizedCode\": \"The full corrected and optimized version of the code\",\n" +
                "  \"bestPractices\": [\"list of code quality suggestions\"],\n" +
                "  \"complexityAnalysis\": {\n" +
                "    \"time\": \"e.g., O(N)\",\n" +
                "    \"space\": \"e.g., O(1)\"\n" +
                "  }\n" +
                "}\n" +
                "Ensure that line numbers in detectedErrors match the corresponding lines of the submitted code. If the code is correct, return empty detectedErrors.";
    }

    private AiResponse parseGeminiResponse(String rawJson) {
        try {
            JsonNode rootNode = objectMapper.readTree(rawJson);
            String text = rootNode.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text")
                    .asText();
            
            String cleanedJson = cleanJsonResponse(text);
            return objectMapper.readValue(cleanedJson, AiResponse.class);
        } catch (Exception e) {
            System.err.println("Failed to parse Gemini response: " + e.getMessage());
            throw new RuntimeException("AI response formatting error", e);
        }
    }

    private String cleanJsonResponse(String rawText) {
        if (rawText == null) return "{}";
        rawText = rawText.trim();
        if (rawText.startsWith("```json")) {
            rawText = rawText.substring(7);
        } else if (rawText.startsWith("```")) {
            rawText = rawText.substring(3);
        }
        if (rawText.endsWith("```")) {
            rawText = rawText.substring(0, rawText.length() - 3);
        }
        return rawText.trim();
    }

    private AiResponse generateFallbackMockResponse(String code, String language) {
        AiResponse response = new AiResponse();
        response.setSummary("Mock Debug Analysis (API Key not configured or API error occurred). Successfully parsed request.");
        
        List<DetectedError> errors = new ArrayList<>();
        // Try to identify some general errors for display
        if (code.contains("==") && (language.equalsIgnoreCase("javascript") || language.equalsIgnoreCase("typescript"))) {
            errors.add(new DetectedError(
                findLineNumber(code, "=="), 
                "Comparison Operator Warning", 
                "Using '==' performs type coercion, which can lead to unexpected behaviors.", 
                "Use the strict comparison operator '===' instead."
            ));
        } else if (code.contains("print") && !code.contains("print(") && language.equalsIgnoreCase("python")) {
            errors.add(new DetectedError(
                findLineNumber(code, "print"), 
                "SyntaxError: Missing parentheses", 
                "In Python 3, print is a function and requires parentheses.", 
                "Change print statement to print(...) call."
            ));
        } else {
            errors.add(new DetectedError(
                1, 
                "Initial Review Check", 
                "Review of code completed successfully. No critical syntactical exceptions found in initial local lint.", 
                "Check logic flows or connect a real Gemini API Key for deep inspection."
            ));
        }
        response.setDetectedErrors(errors);
        
        // Add optimized version
        response.setOptimizedCode("// Optimized Version:\n" + code.replace("==", "==="));
        
        // Add practices
        List<String> practices = new ArrayList<>();
        practices.add("Write unit tests to verify corner cases.");
        practices.add("Maintain consistent spacing and variable naming conventions.");
        response.setBestPractices(practices);
        
        // Complexity
        response.setComplexityAnalysis(new ComplexityAnalysis("O(N)", "O(1)"));
        
        return response;
    }

    private int findLineNumber(String code, String snippet) {
        String[] lines = code.split("\n");
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].contains(snippet)) {
                return i + 1;
            }
        }
        return 1;
    }
}
