package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;
import java.util.Optional;
import org.junit.jupiter.api.extension.ExtendWith;


import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductImage;
import be.vinci.ipl.cae.demo.repositories.ProductImageRepository;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductImageServiceTest {

  @Mock
  private ProductImageRepository productImageRepository;
  @Mock
  private ProductRepository productRepository;

  @InjectMocks
  private ProductImageService productImageService;

  private ProductImage image1;
  private ProductImage image2;
  private Product product;

  @BeforeEach
  void setUp() {
   product = new Product();
    product.setProductId(1L);
    product.setLabel("Test Product");

    image1 = new ProductImage();
    image1.setImageId(1L);
    image1.setUrl("http://example.com/image1.jpg");
    image1.setProduct(product);

    image2 = new ProductImage();
    image2.setImageId(2L);
    image2.setUrl("http://example.com/image2.jpg");
    image2.setProduct(product);
  }

  @Test
  void getImageUrlsByProductId_ShouldReturnEmptyListWhenNoImages() {
    Long productId = product.getProductId();
    // Arrange
    when(productRepository.findById(productId)).thenReturn(Optional.of(product));
    when(productImageRepository.findByProductProductId(productId)).thenReturn(new ArrayList<>());

    // Act
    List<String> result = productImageService.getImageUrlsByProductId(productId);

    // Assert
    assertAll(
      () -> assertNotNull(result),
      () -> assertTrue(result.isEmpty())
    );
    verify(productRepository).findById(productId);
    verify(productImageRepository).findByProductProductId(productId);
  }

  @Test
  void getImageUrlsByProductId_ShouldReturnImageUrls() {
    // Arrange
    Long productId = product.getProductId();
    when(productImageRepository.findByProductProductId(productId))
        .thenReturn(Arrays.asList(image1, image2));
    when(productRepository.findById(productId)).thenReturn(Optional.of(product));

    // Act
    List<String> result = productImageService.getImageUrlsByProductId(productId);

    // Assert
    assertAll("verify result list",
    () -> assertNotNull(result),
    () -> assertEquals(2, result.size()),
    () -> assertTrue(result.contains("http://example.com/image1.jpg")),
    () -> assertTrue(result.contains("http://example.com/image2.jpg"))
    );
    verify(productRepository).findById(productId);
    verify(productImageRepository).findByProductProductId(productId);
  }
  @Test
  void getImageUrlsByProductId_ShouldThrowWhenProductNotFound() {
    // Arrange
    Long invalidProductId = 999L;
    when(productRepository.findById(invalidProductId)).thenReturn(Optional.empty());

    // Act & Assert
    ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class,
        () -> productImageService.getImageUrlsByProductId(invalidProductId));

    assertEquals("Product with ID 999 not found", exception.getMessage());
  }

}