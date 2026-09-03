package com.rivals.storage;

import com.rivals.common.NotFoundException;
import com.rivals.common.ValidationException;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Local filesystem screenshot storage (research.md #2) — no Docker/cloud object storage is
 * available in this environment, so uploaded screenshots live under a local directory and the
 * database stores only a relative file reference.
 */
@Service
public class ScreenshotStorageService {

    private final Path uploadsDirectory;

    public ScreenshotStorageService(@Value("${rivals.uploads.directory}") String uploadsDirectory) {
        this.uploadsDirectory = Paths.get(uploadsDirectory).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadsDirectory);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not create uploads directory", e);
        }
    }

    /** Stores the screenshot and returns its reference (relative filename). */
    public String store(MultipartFile screenshot) {
        if (screenshot == null || screenshot.isEmpty()) {
            throw new ValidationException("screenshot is required", java.util.List.of(
                    new com.rivals.common.ErrorResponse.FieldError("screenshot", "is required")));
        }
        String extension = extensionOf(screenshot.getOriginalFilename());
        String ref = UUID.randomUUID() + extension;
        Path target = uploadsDirectory.resolve(ref);
        try {
            screenshot.transferTo(target);
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to store screenshot", e);
        }
        return ref;
    }

    public StoredFile load(String ref) {
        Path path = uploadsDirectory.resolve(ref).normalize();
        if (!path.startsWith(uploadsDirectory) || !Files.exists(path)) {
            throw new NotFoundException("Screenshot not found");
        }
        try {
            byte[] content = Files.readAllBytes(path);
            String contentType = Files.probeContentType(path);
            return new StoredFile(content, contentType != null ? contentType : "application/octet-stream");
        } catch (IOException e) {
            throw new UncheckedIOException("Failed to read screenshot", e);
        }
    }

    private static String extensionOf(String originalFilename) {
        if (originalFilename == null) {
            return "";
        }
        int dot = originalFilename.lastIndexOf('.');
        return dot >= 0 ? originalFilename.substring(dot) : "";
    }

    public record StoredFile(byte[] content, String contentType) {
    }
}
