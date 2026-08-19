package com.kalpanaafinance.config;

import com.kalpanaafinance.modules.shared.entity.ConsultantProfile;
import com.kalpanaafinance.modules.shared.entity.Role;
import com.kalpanaafinance.modules.shared.entity.User;
import com.kalpanaafinance.modules.shared.repository.ConsultantProfileRepository;
import com.kalpanaafinance.modules.shared.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class ConsultantDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ConsultantProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (profileRepository.count() == 0) {
            System.out.println("Seeding initial mock consultants...");

            seedConsultant("Ananya Rao", "ananya.rao@kalpanaafinance.com", "Investment & Wealth");
            seedConsultant("Rahul Mehta", "rahul.mehta@kalpanaafinance.com", "Lending & Credit");
            seedConsultant("Priya Nair", "priya.nair@kalpanaafinance.com", "Digital Finance");
            seedConsultant("Arjun Menon", "arjun.menon@kalpanaafinance.com", "Business Finance");
            
            System.out.println("Consultant seeding completed.");
        }
    }

    private void seedConsultant(String name, String email, String specialization) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setRole(Role.CONSULTANT);
        user.setPasswordHash(passwordEncoder.encode("password123")); // simple password for demo
        user.setPhone("+91 9000000000");
        user = userRepository.save(user);

        ConsultantProfile profile = new ConsultantProfile();
        profile.setUser(user);
        profile.setSpecialization(specialization);
        profile.setExperienceYears(5);
        profile.setBio("Expert consultant specializing in " + specialization);
        profile.setWorkingDays("Mon-Fri");
        profile.setWorkingHoursStart("09:00");
        profile.setWorkingHoursEnd("17:00");
        profile.setMaxSessionsPerDay(8);
        profile.setStatus("ACTIVE");

        profileRepository.save(profile);
    }
}
