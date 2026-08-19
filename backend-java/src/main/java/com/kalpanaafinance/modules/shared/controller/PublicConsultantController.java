package com.kalpanaafinance.modules.shared.controller;

import com.kalpanaafinance.modules.shared.entity.ConsultantProfile;
import com.kalpanaafinance.modules.consultant.service.ConsultantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/consultants")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PublicConsultantController {

    private final ConsultantService consultantService;

    @GetMapping
    public ResponseEntity<List<ConsultantProfile>> getAllConsultants() {
        return ResponseEntity.ok(consultantService.getAllConsultants());
    }
}
