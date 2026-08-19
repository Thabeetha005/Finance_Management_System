package com.kalpanaafinance.service;

import com.kalpanaafinance.dto.ConsultantProfileRequest;
import com.kalpanaafinance.entity.*;
import com.kalpanaafinance.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import jakarta.persistence.EntityManager;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConsultantService {

    private final ConsultantProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;
    private final MessageRepository messageRepository;
    private final ConsultationAssignmentRepository assignmentRepository;
    private final ConsultationRepository consultationRepository;
    private final AuditService auditService;
    private final MessageService messageService;

    public List<ConsultantProfile> getAllConsultants() {
        return profileRepository.findAll();
    }

    public ConsultantProfile getConsultantById(Long id) {
        return profileRepository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultant not found"));
    }

    public ConsultantProfile createConsultant(ConsultantProfileRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(Role.CONSULTANT);
        String rawPassword = (request.getPassword() != null && !request.getPassword().isEmpty()) 
            ? request.getPassword() 
            : "TempPassword123!";
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        user = userRepository.save(user);

        ConsultantProfile profile = new ConsultantProfile();
        profile.setUser(user);
        profile.setSpecialization(request.getSpecialization());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setQualification(request.getQualification());
        profile.setBio(request.getBio());
        profile.setProfileImageUrl(request.getProfileImageUrl());
        profile.setWorkingDays(request.getWorkingDays());
        profile.setWorkingHoursStart(request.getWorkingHoursStart());
        profile.setWorkingHoursEnd(request.getWorkingHoursEnd());
        profile.setMaxSessionsPerDay(request.getMaxSessionsPerDay());
        profile.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");

        return profileRepository.save(profile);
    }

    public ConsultantProfile updateConsultant(Long id, ConsultantProfileRequest request) {
        ConsultantProfile profile = getConsultantById(id);
        
        User user = profile.getUser();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        profile.setSpecialization(request.getSpecialization());
        profile.setExperienceYears(request.getExperienceYears());
        profile.setQualification(request.getQualification());
        profile.setBio(request.getBio());
        profile.setProfileImageUrl(request.getProfileImageUrl());
        profile.setWorkingDays(request.getWorkingDays());
        profile.setWorkingHoursStart(request.getWorkingHoursStart());
        profile.setWorkingHoursEnd(request.getWorkingHoursEnd());
        profile.setMaxSessionsPerDay(request.getMaxSessionsPerDay());
        if (request.getStatus() != null) profile.setStatus(request.getStatus());

        return profileRepository.save(profile);
    }

    @Transactional
    public void deleteConsultant(Long adminId, Long consultantId, String reason, String clientIp) {
        if (reason == null || reason.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Deletion reason is mandatory");
        }

        ConsultantProfile profile = profileRepository.findById(consultantId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consultant profile not found"));
        User consultantUser = profile.getUser();
        Long userId = consultantUser.getId();
        String consultantName = consultantUser.getName();

        // 1. Mark status as PENDING_TERMINATION (retaining user in DB until consultant acknowledges pop-up)
        profile.setStatus("PENDING_TERMINATION");
        profile.setTerminationReason(reason.trim());
        profileRepository.save(profile);

        consultantUser.setAccountStatus("PENDING_TERMINATION");
        userRepository.save(consultantUser);

        // 2. Send System Notification Message to the consultant
        Message deactivationMsg = Message.builder()
                .recipientUserId(userId)
                .senderUserId(adminId)
                .senderRole("ADMIN")
                .subject("Account Termination Notice")
                .messageContent("Your consultant account has been scheduled for termination by Administration.\n\nReason:\n" + reason.trim() + 
                        "\n\nPlease review and confirm this notice upon logging in.")
                .messageType(Message.MessageType.SYSTEM)
                .relatedEntityType(Message.EntityType.CONSULTATION)
                .relatedEntityId(consultantId)
                .isRead(false)
                .build();
        messageRepository.save(deactivationMsg);

        // 3. Admin Audit Log
        auditService.logAction(
                "admin-" + adminId,
                "CONSULTANT_TERMINATION_INITIATED",
                "CONSULTANT",
                consultantId,
                "Consultant " + consultantName + " (ID #" + consultantId + ") marked for termination by Admin. Reason: " + reason.trim(),
                clientIp != null ? clientIp : "127.0.0.1"
        );

        // 4. Reassign active consultation assignments
        List<ConsultationAssignment> assignments = assignmentRepository.findByConsultantId(consultantId);
        for (ConsultationAssignment assignment : assignments) {
            Consultation consultation = assignment.getConsultation();
            if (consultation != null) {
                consultation.setStatus("UNASSIGNED");
                consultation.setAdminActionTaken("Consultant " + consultantName + " scheduled for termination. Reassignment required.");
                consultationRepository.save(consultation);

                messageService.sendSystemMessage(adminId, "Consultation Reassignment Required",
                        "Consultation #" + consultation.getId() + " (" + consultation.getType() + ") was moved to UNASSIGNED due to consultant termination.",
                        Message.EntityType.CONSULTATION, consultation.getId());
            }
        }
    }

    @Transactional
    public void confirmTerminationAndPurge(Long userId, String clientIp) {
        User consultantUser = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ConsultantProfile profile = profileRepository.findByUserId(userId).orElse(null);
        Long consultantId = profile != null ? profile.getId() : null;
        String consultantName = consultantUser.getName();

        // 1. Audit log confirmation
        auditService.logAction(
                consultantUser.getEmail(),
                "CONSULTANT_TERMINATION_CONFIRMED",
                "CONSULTANT",
                consultantId != null ? consultantId : userId,
                "Consultant " + consultantName + " acknowledged termination pop-up and confirmed account deactivation.",
                clientIp != null ? clientIp : "127.0.0.1"
        );

        // 2. Delete consultant child records
        if (consultantId != null) {
            entityManager.createQuery("DELETE FROM ConsultationNote n WHERE n.session.id IN (SELECT s.id FROM ConsultationSession s WHERE s.assignment.id IN (SELECT a.id FROM ConsultationAssignment a WHERE a.consultant.id = :id))").setParameter("id", consultantId).executeUpdate();
            entityManager.createQuery("DELETE FROM ConsultationSession s WHERE s.assignment.id IN (SELECT a.id FROM ConsultationAssignment a WHERE a.consultant.id = :id)").setParameter("id", consultantId).executeUpdate();
            entityManager.createQuery("DELETE FROM ConsultationAssignment a WHERE a.consultant.id = :id").setParameter("id", consultantId).executeUpdate();
            entityManager.createQuery("DELETE FROM ConsultantAvailability a WHERE a.consultant.id = :id").setParameter("id", consultantId).executeUpdate();
            
            profileRepository.delete(profile);
        }

        // 3. Delete notifications and activity logs
        entityManager.createQuery("DELETE FROM Notification n WHERE n.user.id = :id").setParameter("id", userId).executeUpdate();
        entityManager.createQuery("DELETE FROM ActivityLog a WHERE a.user.id = :id").setParameter("id", userId).executeUpdate();

        // 4. Delete user record
        userRepository.delete(consultantUser);
    }
}
