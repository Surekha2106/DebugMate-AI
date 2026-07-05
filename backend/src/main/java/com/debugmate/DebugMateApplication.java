package com.debugmate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
public class DebugMateApplication {
    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(DebugMateApplication.class, args);
    }

    private static void loadDotEnv() {
        Path[] pathsToTry = {
            Paths.get(".env"),
            Paths.get("../.env"),
            Paths.get("backend/.env")
        };
        for (Path path : pathsToTry) {
            if (Files.exists(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        if (eqIdx > 0) {
                            String key = line.substring(0, eqIdx).trim();
                            String value = line.substring(eqIdx + 1).trim();
                            if (value.startsWith("\"") && value.endsWith("\"")) {
                                value = value.substring(1, value.length() - 1);
                            } else if (value.startsWith("'") && value.endsWith("'")) {
                                value = value.substring(1, value.length() - 1);
                            }
                            System.setProperty(key, value);
                        }
                    }
                    System.out.println("Loaded environment variables from " + path.toAbsolutePath());
                    break;
                } catch (IOException e) {
                    System.err.println("Could not read .env file: " + e.getMessage());
                }
            }
        }
    }
}
