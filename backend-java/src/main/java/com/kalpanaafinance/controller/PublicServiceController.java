package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.Service;
import com.kalpanaafinance.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class PublicServiceController {

    private final ServiceRepository serviceRepository;

    @GetMapping
    public ResponseEntity<List<Service>> getPublishedServices() {
        // Return all published services
        List<Service> services = serviceRepository.findAll().stream()
                .filter(Service::getIsPublished)
                .toList();
        return ResponseEntity.ok(services);
    }
}
