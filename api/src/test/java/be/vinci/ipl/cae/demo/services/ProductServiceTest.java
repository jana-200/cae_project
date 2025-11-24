package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.dtos.ProductDto;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Unit;
import be.vinci.ipl.cae.demo.repositories.ProductRepository;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

  @Mock
  private ProductRepository productRepository;
  @Mock
  private UnitService unitService;
  @Mock
  private ProductTypeService productTypeService;
  @InjectMocks
  private ProductService productService;

  private Product product1, product2;
  private ProductType type1;
  private Unit unit1;

  @BeforeEach
  void setUp() {
    type1 = new ProductType();
    type1.setLabel("Electronics");
    type1.setTypeId(1L);

    unit1 = new Unit();
    unit1.setLabel("kg");
    unit1.setUnitId(1L);

    product1 = new Product();
    product1.setLabel("Laptop");
    product1.setDescription("High performance laptop");
    product1.setType(type1);
    product1.setUnit(unit1);
    product1.setProductId(1L);

    product2 = new Product();
    product2.setLabel("Smartphone");
    product2.setDescription("Latest model smartphone");
    product2.setType(type1);
    product2.setUnit(unit1);
    product2.setProductId(2L);
  }

  @Test
  void findByLabelIgnoreCaseWhenExists() {
    when(productRepository.findByLabelIgnoreCase(product1.getLabel()))
        .thenReturn(product1);

    Product result = productService.findByLabelIgnoreCase(product1.getLabel());

    assertAll(()->
    assertNotNull(result),
    ()-> assertEquals(product1.getLabel(), result.getLabel()));
    verify(productRepository).findByLabelIgnoreCase(product1.getLabel());
  }

  @Test
  void findByLabelIgnoreCaseWhenNotExists() {
    String unknownLabel = "Unknown";
    when(productRepository.findByLabelIgnoreCase(unknownLabel))
        .thenReturn(null);

    Product result = productService.findByLabelIgnoreCase(unknownLabel);

    assertNull(result);
    verify(productRepository).findByLabelIgnoreCase(unknownLabel);
  }

  @Test
  void findAllShouldReturnAllProducts() {
    List<Product> products = List.of(product1, product2);
    when(productRepository.findAll()).thenReturn(products);

    List<ProductDto> result = productService.findAll();

    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(products.size(), result.size()),
        () -> assertEquals(product1.getLabel(), result.get(0).getLabel()),
        () -> assertEquals(product2.getLabel(), result.get(1).getLabel())
    );
    verify(productRepository).findAll();
  }

  @Test
  void findByLabelPrefixShouldReturnMatchingProducts() {
    String prefix = "Lap";
    List<Product> products = List.of(product1);
    when(productRepository.findByLabelStartingWithIgnoreCase(prefix))
        .thenReturn(products);

    List<ProductDto> result = productService.findByLabelPrefix(prefix);

    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(products.size(), result.size()),
        () -> assertEquals(product1.getLabel(), result.get(0).getLabel())
    );
    verify(productRepository).findByLabelStartingWithIgnoreCase(prefix);
  }

  @Test
  void createProductWithExistingUnit() {
    when(unitService.findByLabel(unit1.getLabel()))
        .thenReturn(unit1);

    ProductDto productDto = new ProductDto();
    productDto.setLabel(product1.getLabel());
    productDto.setDescription(product1.getDescription());
    productDto.setUnit(unit1.getLabel());
    productDto.setType(type1.getLabel());

    when(productRepository.save(any(Product.class)))
        .thenReturn(product1);
    Product result = productService.createProduct(productDto);


    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(product1.getLabel(), result.getLabel())
    );
    verify(unitService).findByLabel(unit1.getLabel());
    verify(unitService, never()).create(anyString());
    verify(productRepository).save(any(Product.class));
  }

  @Test
  void createProductWithNewUnit() {
    String newUnitLabel = "piece";
    when(unitService.findByLabel(newUnitLabel))
        .thenReturn(null);
    when(unitService.create(newUnitLabel))
        .thenReturn(new Unit());
    when(productRepository.save(any(Product.class)))
        .thenReturn(product2);

    ProductDto productDto = new ProductDto();
    productDto.setLabel(product2.getLabel());
    productDto.setDescription(product2.getDescription());
    productDto.setUnit(newUnitLabel);
    productDto.setType(type1.getLabel());
      
    Product result = productService.createProduct(productDto);

    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(product2.getLabel(), result.getLabel())
    );
    verify(unitService).findByLabel(newUnitLabel);
    verify(unitService).create(newUnitLabel);
    verify(productRepository).save(any(Product.class));
  }

  @Test
  void findByLabelPrefixShouldHandleProductWithNullType() {
    // Arrange
    product1.setType(null);
    when(productRepository.findByLabelStartingWithIgnoreCase("Lap")).thenReturn(List.of(product1));

    // Act
    List<ProductDto> result = productService.findByLabelPrefix("Lap");

    // Assert
    assertAll(
        () -> assertEquals(1, result.size()),
        () -> assertEquals("Laptop", result.get(0).getLabel())
    );
    assertNull(result.get(0).getType());
  }

}