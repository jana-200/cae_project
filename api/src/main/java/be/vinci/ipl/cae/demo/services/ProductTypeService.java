package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.ProductTypeDto;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * Service class responsible for managing product types.
 */
@Service
public class ProductTypeService {

  private final ProductTypeRepository productTypeRepository;

  /**
   * Constructor for ProductTypeService.
   *
   * @param productTypeRepository the repository for accessing product type data
   */
  public ProductTypeService(ProductTypeRepository productTypeRepository) {
    this.productTypeRepository = productTypeRepository;
  }

  /**
   * Retrieves all product types.
   *
   * @return a list of ProductTypeDto
   */
  public List<ProductTypeDto> findAll() {
    return productTypeRepository.findAll().stream()
        .map(p -> new ProductTypeDto(p.getTypeId(), p.getLabel()))
        .sorted(Comparator.comparing(ProductTypeDto::getLabel))
        .toList();
  }

  /**
   * Finds a product type by its label.
   *
   * @param label the product type label
   * @return the product type entity if found, otherwise null
   */
  public ProductType findByLabel(String label) {
    if (label == null || label.isBlank()) {
      return null;
    }
    return productTypeRepository.findProductTypeByLabel(label);
  }

  /**
   * Creates a new product type.
   *
   * @param dto the ProductTypeDto to create
   * @return the created ProductTypeDto
   */
  public ProductTypeDto create(ProductTypeDto dto) {
    if (dto.getLabel() == null || dto.getLabel().isBlank()) {
      throw new BadRequestException("Label is required");
    }

    ProductType existing = productTypeRepository.findProductTypeByLabelIgnoreCase(dto.getLabel());
    if (existing != null) {
      throw new ConflictException("Product type already exists");
    }

    ProductType newType = new ProductType();
    newType.setLabel(dto.getLabel());
    ProductType saved = productTypeRepository.save(newType);
    return new ProductTypeDto(saved.getTypeId(), saved.getLabel());
  }

  /**
   * Updates a product type by ID.
   *
   * @param id the ID of the product type to update
   * @param dto the ProductTypeDto with updated values
   * @return the updated ProductTypeDto, or null if not found
   */
  public ProductTypeDto update(Long id, ProductTypeDto dto) {
    if (dto.getLabel() == null || dto.getLabel().isBlank()) {
      throw new BadRequestException("Label is required");
    }
    ProductType type = productTypeRepository.findById(id).orElse(null);
    if (type == null) {
      throw new ResourceNotFoundException("Product type not found");
    }

    type.setLabel(dto.getLabel());
    ProductType updated = productTypeRepository.save(type);
    return new ProductTypeDto(updated.getTypeId(), updated.getLabel());
  }
}