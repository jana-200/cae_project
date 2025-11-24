package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.models.dtos.ProductDto;
import be.vinci.ipl.cae.demo.services.ProductImageService;
import be.vinci.ipl.cae.demo.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * ProductController to handle lots.
 */
@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "http://localhost:5173")
public class ProductController {

  private final ProductService productService;
  private final ProductImageService productImageService;

  /**
   * Constructor for ProductController.
   *
   * @param productService the service to handle product-related operations
   * @param productImageService the service to handle product image-related operations
   */
  public ProductController(ProductService productService, ProductImageService productImageService) {
    this.productService = productService;
    this.productImageService = productImageService;
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Get all products or filter by label prefix.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "List of All Products"),
  })
  @GetMapping("/")
  public List<ProductDto> getAllProducts(@RequestParam(required = false) String label) {
    if (label != null && !label.isBlank()) {
      return productService.findByLabelPrefix(label);
    }
    return productService.findAll();
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Get all image URLs for a specific product by ID.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "List of All Products"),
      @ApiResponse(responseCode = "403", description = "Forbidden – missing or invalid token"),
      @ApiResponse(responseCode = "404", description = "Product not found"),
      @ApiResponse(responseCode = "400", description = "Bad Request - Invalid Product ID"),
      @ApiResponse(responseCode = "401", description = "User must be authenticated"),

  })
  @GetMapping("/{productId}/images")
  @PreAuthorize("hasRole('ROLE_PRODUCER')")
  public List<String> getProductImages(@PathVariable Long productId) {
    if (productId <= 0) {
      throw new BadRequestException("Invalid Product ID");
    }
    return productImageService.getImageUrlsByProductId(productId);
  }
}
