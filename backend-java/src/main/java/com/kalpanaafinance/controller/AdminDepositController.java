package com.kalpanaafinance.controller;

import com.kalpanaafinance.modules.shared.entity.Deposit;
import com.kalpanaafinance.modules.user.service.DepositService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/deposits")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN') or hasRole('SUPER_ADMIN') or hasRole('admin')")
public class AdminDepositController {

    private final DepositService depositService;

    @GetMapping
    public ResponseEntity<List<Deposit>> getAllDeposits() {
        return ResponseEntity.ok(depositService.getAllDepositsForAdmin());
    }
}
