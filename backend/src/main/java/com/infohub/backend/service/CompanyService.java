package com.infohub.backend.service;

import com.infohub.backend.dto.CompanyRequest;
import com.infohub.backend.entity.Company;
import com.infohub.backend.entity.User;
import com.infohub.backend.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CompanyService {

    private final CompanyRepository companyRepository;

    @Autowired
    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company addCompany(User user, CompanyRequest request) {
        Company company = Company.builder()
                .user(user)
                .name(request.getName())
                .website(request.getWebsite())
                .privacyPolicyUrl(request.getPrivacyPolicyUrl())
                .dataCategories(request.getDataCategories())
                .riskScore(calculateInitialRisk(request))
                .build();
        company.setRiskLevel(getRiskLevel(company.getRiskScore()));
        return companyRepository.save(company);
    }

    public Page<Company> getCompanies(Long userId, String search, int page, int size, String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy).descending());
        return companyRepository.findByUserIdWithSearch(userId, search, pageable);
    }

    public List<Company> getAllCompanies(Long userId) {
        return companyRepository.findByUserId(userId);
    }

    public Company getCompany(Long id, Long userId) {
        Company c = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        if (!c.getUser().getId().equals(userId)) throw new RuntimeException("Access denied");
        return c;
    }

    public Company updateCompany(Long id, Long userId, CompanyRequest request) {
        Company company = getCompany(id, userId);
        company.setName(request.getName());
        company.setWebsite(request.getWebsite());
        company.setPrivacyPolicyUrl(request.getPrivacyPolicyUrl());
        company.setDataCategories(request.getDataCategories());
        return companyRepository.save(company);
    }

    public void deleteCompany(Long id, Long userId) {
        Company company = getCompany(id, userId);
        companyRepository.delete(company);
    }

    public void updateRiskScore(Long companyId, double score) {
        companyRepository.findById(companyId).ifPresent(c -> {
            c.setRiskScore(score);
            c.setRiskLevel(getRiskLevel(score));
            companyRepository.save(c);
        });
    }

    private double calculateInitialRisk(CompanyRequest req) {
        double base = 30.0;
        String cats = req.getDataCategories();
        if (cats != null && cats.contains("financial")) base += 20;
        if (cats != null && cats.contains("location"))  base += 15;
        if (cats != null && cats.contains("health"))    base += 25;
        return Math.min(base, 100.0);
    }

    public String getRiskLevel(double score) {
        if (score < 25) return "Low";
        if (score < 50) return "Medium";
        if (score < 75) return "High";
        return "Critical";
    }
}
