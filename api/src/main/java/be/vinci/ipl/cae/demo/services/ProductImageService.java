package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.entities.ProductImage;
import be.vinci.ipl.cae.demo.repositories.ProductImageRepository;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

/**
 * Service class for managing product images.
 */
@Service
public class ProductImageService {

  private final ProductImageRepository productImageRepository;
  private final ProductRepository productRepository;

  /**
   * Constructor for ProductImageService.
   *
   * @param productImageRepository the repository to manage product images
   */
  public ProductImageService(ProductImageRepository productImageRepository,
      ProductRepository productRepository) {
    this.productImageRepository = productImageRepository;
    this.productRepository = productRepository;
  }

  /**
   * Retrieve all image URLs for a specific product by its ID.
   *
   * @param productId the ID of the product
   * @return a list of image URLs associated with the product
   */
  public List<String> getImageUrlsByProductId(Long productId) {
    productRepository.findById(productId)
        .orElseThrow(() ->
            new ResourceNotFoundException("Product with ID " + productId + " not found"));
    List<ProductImage> productImages = productImageRepository.findByProductProductId(productId);

    return productImages.stream()
        .map(ProductImage::getUrl)
        .collect(Collectors.toList());
  }
}