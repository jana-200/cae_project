package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.models.dtos.ProductTypeDto;
import be.vinci.ipl.cae.demo.services.ProductTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * ProductTypeController to handle product types.
 */
@RestController
@RequestMapping("/product-types")
public class ProductTypeController {

  private final ProductTypeService productTypeService;

  /**
   * Constructor for the product type controller.
   *
   * @param productTypeService the injected productTypeService.
   */
  public ProductTypeController(ProductTypeService productTypeService) {
    this.productTypeService = productTypeService;
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Retrieves all product types available in the database.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "List of product Types"),
  })
  @GetMapping("/")
  public List<ProductTypeDto> getAllProductTypes() {
    return productTypeService.findAll();
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Creates a new product type.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Product type created"),
      @ApiResponse(responseCode = "400", description = "Invalid product type"),
      @ApiResponse(responseCode = "409", description = "Product type already exists"),
      @ApiResponse(responseCode = "403", description = "Not authorized must be a manger"),
      @ApiResponse(responseCode = "401", description = "Manager must be authenticated"),
  })
  @PostMapping("/")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  @ResponseStatus(HttpStatus.CREATED)
  public ProductTypeDto createProductType(@RequestBody ProductTypeDto dto) {
    if (dto.getLabel() == null || dto.getLabel().isBlank()) {
      throw new BadRequestException("Label is required");
    }
    return productTypeService.create(dto);
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Updates an existing product type.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Product type updated"),
      @ApiResponse(responseCode = "404", description = "Product type not found"),
      @ApiResponse(responseCode = "400",
          description = "ID is invalid or missing label"),
      @ApiResponse(responseCode = "403", description = "Not authorized must be a manger"),
      @ApiResponse(responseCode = "401", description = "Manager must be authenticated"),

  })
  @PutMapping("/{id}")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  @ResponseStatus(HttpStatus.OK)
  public ProductTypeDto updateProductType(@PathVariable Long id, @RequestBody ProductTypeDto dto) {
    if (dto.getLabel() == null || dto.getLabel().isBlank()) {
      throw new BadRequestException("Label is required");
    }
    if (dto.getTypeId() != null && !dto.getTypeId().equals(id)) {
      throw new BadRequestException("ID in body does not match ID in URL");
    }

    return productTypeService.update(id, dto);
  }
}
