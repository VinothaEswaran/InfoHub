package com.infohub.backend.controller;

import com.infohub.backend.dto.ApiResponse;
import com.infohub.backend.entity.DeletionRequest;
import com.infohub.backend.entity.User;
import com.infohub.backend.service.AuthService;
import com.infohub.backend.service.DeletionService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.io.File;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deletion")
@RequiredArgsConstructor
public class DeletionController {

    private final DeletionService deletionService;
    private final AuthService authService;

    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<DeletionRequest>> generate(
            @RequestBody Map<String, Object> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        Long companyId = Long.valueOf(body.get("companyId").toString());
        DeletionRequest.Jurisdiction jurisdiction =
                DeletionRequest.Jurisdiction.valueOf(body.get("jurisdiction").toString());
        DeletionRequest req = deletionService.generateDeletionRequest(user, companyId, jurisdiction);
        return ResponseEntity.ok(ApiResponse.ok("Deletion letter generated", req));
    }

    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<List<DeletionRequest>>> getRequests(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(deletionService.getRequests(user.getId())));
    }

    @PutMapping("/requests/{id}/status")
    public ResponseEntity<ApiResponse<DeletionRequest>> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        DeletionRequest.Status status = DeletionRequest.Status.valueOf(body.get("status"));
        return ResponseEntity.ok(ApiResponse.ok("Status updated",
                deletionService.updateStatus(id, user.getId(), status)));
    }

    @GetMapping("/requests/{id}/pdf")
    public ResponseEntity<FileSystemResource> downloadPdf(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        String path = deletionService.getPdfPath(id, user.getId());
        if (path == null) return ResponseEntity.notFound().build();
        File file = new File(path);
        if (!file.exists()) return ResponseEntity.notFound().build();
        FileSystemResource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=deletion_request_" + id + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
