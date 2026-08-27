package com.infohub.backend.controller;

import com.infohub.backend.dto.ApiResponse;
import com.infohub.backend.dto.CompanyRequest;
import com.infohub.backend.entity.Company;
import com.infohub.backend.entity.User;
import com.infohub.backend.service.AuthService;
import com.infohub.backend.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;
    private final AuthService authService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Company>>> getCompanies(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "addedAt") String sortBy) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(
                companyService.getCompanies(user.getId(), search, page, size, sortBy)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<?>> getAllCompanies(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(companyService.getAllCompanies(user.getId())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Company>> getCompany(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok(companyService.getCompany(id, user.getId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Company>> addCompany(
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Company added", companyService.addCompany(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Company>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("Company updated",
                companyService.updateCompany(id, user.getId(), request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getCurrentUser(userDetails.getUsername());
        companyService.deleteCompany(id, user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Company deleted", null));
    }
}
