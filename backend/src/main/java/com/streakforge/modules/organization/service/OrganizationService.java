package com.streakforge.modules.organization.service;

import com.streakforge.modules.organization.domain.Organization;
import com.streakforge.modules.organization.dto.CreateOrganizationRequest;
import com.streakforge.modules.organization.dto.OrganizationDto;
import com.streakforge.modules.organization.repository.OrganizationRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrganizationService {
    private final OrganizationRepository organizationRepository;

    public OrganizationService(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Transactional(readOnly = true)
    public List<OrganizationDto> listOrganizations() {
        return organizationRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public OrganizationDto createOrganization(CreateOrganizationRequest request) {
        organizationRepository.findBySlug(request.slug()).ifPresent(existing -> {
            throw new IllegalArgumentException("Organization slug already exists");
        });
        Organization organization = new Organization();
        organization.setName(request.name());
        organization.setSlug(request.slug());
        Organization saved = organizationRepository.save(organization);
        saved.setOrganizationId(saved.getId());
        return toDto(saved);
    }

    private OrganizationDto toDto(Organization organization) {
        return new OrganizationDto(organization.getId(), organization.getName(), organization.getSlug());
    }
}

