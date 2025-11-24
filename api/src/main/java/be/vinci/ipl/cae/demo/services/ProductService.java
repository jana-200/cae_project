package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.ProductDto;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Unit;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Product service.
 */
@Service
public class ProductService {

  private final ProductRepository productRepository;
  private final UnitService unitService;
  private final ProductTypeService productTypeService;

  /**
   * Constructor.
   *
   */
  public ProductService(ProductRepository productRepository, UnitService unitService, 
      ProductTypeService productTypeService) {
    this.productTypeService = productTypeService;
    this.productRepository = productRepository;
    this.unitService = unitService;
  }

  /**
   * Finds a product by label (case-insensitive).
   *
   * @param label the product label
   * @return the matching product or null if not found
   */
  public Product findByLabelIgnoreCase(String label) {
    return productRepository.findByLabelIgnoreCase(label);
  }

  /**
   * Finds all products.
   *
   * @return list of all product DTOs
   */
  public List<ProductDto> findAll() {

    List<Product> allProducts = (List<Product>) productRepository.findAll();
    return  allProducts.stream().map(this::toDto).collect(Collectors.toList());
  }

  /**
   * Finds all products starting with the given prefix.
   *
   * @param prefix the beginning of the product label
   * @return list of matching product DTOs
   */
  public List<ProductDto> findByLabelPrefix(String prefix) {

    List<Product> allProducts = productRepository.findByLabelStartingWithIgnoreCase(prefix);
    return allProducts.stream()
        .map(this::toDto)
        .collect(Collectors.toList());
  }

  /**
   * Creates and saves a new product.
   *
   * @param dto the product DTO
   * @return the created product
   */
  public Product createProduct(ProductDto dto) {
    Unit unit = unitService.findByLabel(dto.getUnit());
    if (unit == null) {
      unit = unitService.create(dto.getUnit());
    }
    ProductType type = productTypeService.findByLabel(dto.getType());

    Product product = new Product();
    product.setLabel(dto.getLabel());
    product.setDescription(dto.getDescription());
    product.setUnit(unit);
    product.setType(type);
    productRepository.save(product);
    return product;
  }

  /**
   * Converts a Product entity to a DTO.
   */
  private ProductDto toDto(Product product) {
    return new ProductDto(
        product.getProductId(),
        product.getLabel(),
        product.getType() != null ? product.getType().getLabel() : null,
        product.getDescription(),
        product.getUnit().getLabel()
    );
  }
}
