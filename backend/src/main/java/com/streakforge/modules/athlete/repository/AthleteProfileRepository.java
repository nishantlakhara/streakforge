package com.streakforge.modules.athlete.repository;

import com.streakforge.modules.athlete.domain.AthleteProfile;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AthleteProfileRepository extends JpaRepository<AthleteProfile, UUID> {
    List<AthleteProfile> findByOrganizationIdAndDeletedAtIsNullOrderByDisplayNameAsc(UUID organizationId);

    long countByOrganizationIdAndDeletedAtIsNullAndActiveTrue(UUID organizationId);
}
