package com.kalpanaafinance.controller;

import com.kalpanaafinance.entity.Service;
import com.kalpanaafinance.repository.ServiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/services")
@PreAuthorize("hasRole('ADMIN')")
public class AdminServiceController {

    @Autowired
    private ServiceRepository repository;

    @GetMapping
    public ResponseEntity<List<Service>> getAll() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Service> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Service> create(@RequestBody Service entity) {
        return ResponseEntity.ok(repository.save(entity));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Service> update(@PathVariable Long id, @RequestBody Service entity) {
        if(!repository.existsById(id)) return ResponseEntity.notFound().build();
        entity.setId(id);
        return ResponseEntity.ok(repository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if(!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
