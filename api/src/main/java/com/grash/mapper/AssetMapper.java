package com.grash.mapper;

import com.grash.dto.AssetMiniDTO;
import com.grash.dto.AssetPatchDTO;
import com.grash.dto.AssetShowDTO;
import com.grash.dto.MeterShowDTO;
import com.grash.model.Asset;
import com.grash.model.Meter;
import com.grash.model.Reading;
import com.grash.service.AssetService;
import com.grash.service.ReadingService;
import com.grash.utils.AuditComparator;
import com.grash.utils.Helper;
import org.mapstruct.*;

import java.util.Collection;
import java.util.Collections;
import java.util.Date;

@Mapper(componentModel = "spring", uses = {CustomerMapper.class, VendorMapper.class, UserMapper.class,
        TeamMapper.class, FileMapper.class, PartMapper.class, FileMapper.class})
public interface AssetMapper {
    Asset updateAsset(@MappingTarget Asset entity, AssetPatchDTO dto);

    @Mappings({})
    AssetPatchDTO toPatchDto(Asset model);

    AssetShowDTO toShowDto(Asset model, @Context AssetService assetService);

    @Mapping(target = "parentId", source = "parentAsset.id")
    @Mapping(target = "locationId", source = "location.id")
    AssetMiniDTO toMiniDto(Asset model);

    @AfterMapping
    default AssetShowDTO toShowDto(Asset model, @MappingTarget AssetShowDTO target,
                                   @Context AssetService assetService) {
        target.setHasChildren(assetService.hasChildren(model.getId()));
        
        // [MODIFICADO] Construir jerarquía de padres (IDs y Nombres) para el frontend.
        // Impacto: Permite al frontend reconstruir el árbol incluso en resultados de búsqueda plana.
        java.util.List<Long> hierarchy = new java.util.ArrayList<>();
        java.util.List<String> hierarchyNames = new java.util.ArrayList<>();
        Asset current = model.getParentAsset();
        while (current != null) {
            hierarchy.add(0, current.getId());
            hierarchyNames.add(0, current.getName());
            current = current.getParentAsset();
        }
        target.setHierarchy(hierarchy);
        target.setHierarchyNames(hierarchyNames);
        
        return target;
    }
}
