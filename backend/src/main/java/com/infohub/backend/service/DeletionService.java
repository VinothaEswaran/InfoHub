package com.infohub.backend.service;

import com.infohub.backend.entity.Company;
import com.infohub.backend.entity.DeletionRequest;
import com.infohub.backend.entity.User;
import com.infohub.backend.repository.DeletionRequestRepository;
import com.itextpdf.text.*;
import com.itextpdf.text.pdf.PdfWriter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.logging.Logger;

@Service
public class DeletionService {

    private static final Logger log = Logger.getLogger(DeletionService.class.getName());
    private static final String PDF_DIR = "pdfs/";

    private final DeletionRequestRepository deletionRequestRepository;
    private final CompanyService companyService;
    private final NotificationService notificationService;

    @Autowired
    public DeletionService(DeletionRequestRepository deletionRequestRepository,
                           CompanyService companyService,
                           NotificationService notificationService) {
        this.deletionRequestRepository = deletionRequestRepository;
        this.companyService = companyService;
        this.notificationService = notificationService;
    }

    public DeletionRequest generateDeletionRequest(User user, Long companyId,
                                                    DeletionRequest.Jurisdiction jurisdiction) {
        Company company = companyService.getCompany(companyId, user.getId());
        int deadlineDays = switch (jurisdiction) {
            case GDPR -> 30;
            case DPDP -> 30;
            case CCPA -> 45;
        };

        DeletionRequest req = DeletionRequest.builder()
                .user(user)
                .company(company)
                .jurisdiction(jurisdiction)
                .deadline(LocalDate.now().plusDays(deadlineDays))
                .status(DeletionRequest.Status.Draft)
                .build();

        req = deletionRequestRepository.save(req);

        String pdfPath = generatePdf(user, company, req);
        req.setPdfPath(pdfPath);
        req = deletionRequestRepository.save(req);

        notificationService.createStatusUpdate(user, company.getName(), "Draft — Letter Ready");
        return req;
    }

    private String generatePdf(User user, Company company, DeletionRequest req) {
        try {
            Files.createDirectories(Paths.get(PDF_DIR));
            String filename = PDF_DIR + "deletion_" + req.getId() + ".pdf";
            Document doc = new Document();
            PdfWriter.getInstance(doc, new FileOutputStream(filename));
            doc.open();

            Font titleFont = new Font(Font.FontFamily.TIMES_ROMAN, 16, Font.BOLD);
            Font bodyFont  = new Font(Font.FontFamily.TIMES_ROMAN, 12, Font.NORMAL);
            Font boldFont  = new Font(Font.FontFamily.TIMES_ROMAN, 12, Font.BOLD);
            Font smallFont = new Font(Font.FontFamily.TIMES_ROMAN, 9, Font.ITALIC);

            doc.add(new Paragraph("DATA DELETION REQUEST", titleFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Date: " + LocalDate.now(), bodyFont));
            doc.add(new Paragraph("From: " + user.getDisplayName(), bodyFont));
            doc.add(new Paragraph("Email: " + user.getEmail(), bodyFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("To: " + company.getName(), bodyFont));
            if (company.getWebsite() != null)
                doc.add(new Paragraph("Website: " + company.getWebsite(), bodyFont));
            doc.add(new Paragraph(" "));

            String legalBasis = switch (req.getJurisdiction()) {
                case GDPR -> "Article 17 of the General Data Protection Regulation (GDPR) — Right to Erasure";
                case DPDP -> "Section 13 of the Digital Personal Data Protection Act, 2023 (India) — Right of Erasure";
                case CCPA -> "Section 1798.105 of the California Consumer Privacy Act (CCPA) — Right to Delete";
            };

            doc.add(new Paragraph("Subject: Formal Request for Erasure of Personal Data", boldFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Dear Data Controller,", bodyFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(
                "I am writing to formally request the deletion of all personal data you hold " +
                "about me under " + legalBasis + ".", bodyFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("I request that you:", bodyFont));
            doc.add(new Paragraph("1. Immediately cease processing my personal data.", bodyFont));
            doc.add(new Paragraph("2. Delete all records, profiles, and data associated with my account.", bodyFont));
            doc.add(new Paragraph("3. Notify any third parties to whom my data has been shared.", bodyFont));
            doc.add(new Paragraph("4. Confirm in writing that deletion has been completed.", bodyFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph(
                "You are required to respond by " + req.getDeadline().toString() + ". " +
                "Failure to comply may result in a formal complaint to the relevant data protection authority.",
                bodyFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Sincerely,", bodyFont));
            doc.add(new Paragraph(user.getDisplayName(), boldFont));
            doc.add(new Paragraph(user.getEmail(), bodyFont));
            doc.add(new Paragraph(" "));
            doc.add(new Paragraph("Generated by InfoHub — " + LocalDateTime.now(), smallFont));
            doc.close();
            return filename;
        } catch (Exception e) {
            log.severe("PDF generation failed: " + e.getMessage());
            return null;
        }
    }

    public List<DeletionRequest> getRequests(Long userId) {
        return deletionRequestRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public DeletionRequest updateStatus(Long id, Long userId, DeletionRequest.Status status) {
        DeletionRequest req = deletionRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!req.getUser().getId().equals(userId)) throw new RuntimeException("Access denied");
        req.setStatus(status);
        if (status == DeletionRequest.Status.Sent) req.setSentAt(LocalDateTime.now());
        notificationService.createStatusUpdate(req.getUser(), req.getCompany().getName(), status.name());
        return deletionRequestRepository.save(req);
    }

    public String getPdfPath(Long id, Long userId) {
        DeletionRequest req = deletionRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));
        if (!req.getUser().getId().equals(userId)) throw new RuntimeException("Access denied");
        return req.getPdfPath();
    }

    public long getPendingCount(Long userId) {
        return deletionRequestRepository.countByUserIdAndStatusNotIn(userId,
                List.of(DeletionRequest.Status.Completed));
    }

    @Scheduled(cron = "0 0 8 * * *")
    public void checkDeadlines() {
        List<DeletionRequest> overdue = deletionRequestRepository
                .findByStatusAndDeadlineBefore(DeletionRequest.Status.Sent, LocalDate.now());
        for (DeletionRequest req : overdue) {
            req.setStatus(DeletionRequest.Status.Overdue);
            deletionRequestRepository.save(req);
            notificationService.createStatusUpdate(req.getUser(), req.getCompany().getName(), "Overdue");
        }

        List<DeletionRequest> pending = deletionRequestRepository
                .findByStatusAndDeadlineBefore(DeletionRequest.Status.Sent, LocalDate.now().plusDays(8));
        for (DeletionRequest req : pending) {
            long daysLeft = LocalDate.now().until(req.getDeadline()).getDays();
            if (daysLeft == 7 || daysLeft == 1) {
                notificationService.createDeadlineReminder(req.getUser(), req.getCompany().getName(), (int) daysLeft);
            }
        }
    }
}
