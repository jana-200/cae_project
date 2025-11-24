package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.ProductTypeDto;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.repositories.ProductTypeRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProductTypeServiceTest {

  @Mock
  private ProductTypeRepository productTypeRepository;

  @InjectMocks
  private ProductTypeService productTypeService;

  private ProductType productType1;
  private ProductType productType2;

  @BeforeEach
  void setUp() {
    productType1 = new ProductType();
    productType1.setLabel("Electronics");
    productType1.setTypeId(1L);

    productType2 = new ProductType();
    productType2.setLabel("Clothing");
    productType2.setTypeId(2L);
  }

  @Test
  void findAllShouldReturnAllProductTypes() {
    // Arrange
    List<ProductType> expectedTypes = List.of(productType1, productType2);
    when(productTypeRepository.findAll()).thenReturn(expectedTypes);

    // Act
    List<ProductTypeDto> result = productTypeService.findAll();

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(expectedTypes.size(), result.size()),
        () -> assertTrue(result.stream()
            .anyMatch(dto -> dto.getLabel().equals(productType1.getLabel()))),
        () -> assertTrue(result.stream()
            .anyMatch(dto -> dto.getLabel().equals(productType2.getLabel())))
    );
    verify(productTypeRepository).findAll();
  }


  @Test
  void findByLabelShouldReturnProductTypeWhenExists() {
    // Arrange
    when(productTypeRepository.findProductTypeByLabel(productType1.getLabel()))
        .thenReturn(productType1);

    // Act
    ProductType result = productTypeService.findByLabel(productType1.getLabel());

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(productType1.getLabel(), result.getLabel()),
        () -> assertEquals(productType1.getTypeId(), result.getTypeId())
    );
    verify(productTypeRepository).findProductTypeByLabel(productType1.getLabel());
  }

  @Test
  void findByLabelShouldReturnNullWhenNotExists() {
    // Arrange
    String unknownLabel = "Unknown";
    when(productTypeRepository.findProductTypeByLabel(unknownLabel))
        .thenReturn(null);

    // Act
    ProductType result = productTypeService.findByLabel(unknownLabel);

    // Assert
    assertNull(result);
    verify(productTypeRepository).findProductTypeByLabel(unknownLabel);
  }

  @Test
  void findByLabelShouldReturnNullWhenLabelIsNull() {
    // Act
    ProductType result = productTypeService.findByLabel(null);

    // Assert
    assertNull(result);
    verify(productTypeRepository, never()).findProductTypeByLabel(any());
  }

  @Test
  void findByLabelShouldReturnNullWhenLabelIsBlank() {
    // Act
    ProductType result = productTypeService.findByLabel("   ");

    // Assert
    assertNull(result);
    verify(productTypeRepository, never()).findProductTypeByLabel(any());
  }

  @Test
  void create_ShouldReturnCreatedProductTypeDtoWhenValidData() {
    ProductTypeDto dto = new ProductTypeDto(null, "NewType");
    ProductType savedProductType = new ProductType();
    savedProductType.setTypeId(3L);
    savedProductType.setLabel("NewType");

    when(productTypeRepository.findProductTypeByLabelIgnoreCase("NewType")).thenReturn(null);
    when(productTypeRepository.save(any(ProductType.class))).thenReturn(savedProductType);

    ProductTypeDto result = productTypeService.create(dto);

    assertNotNull(result);
    assertEquals("NewType", result.getLabel());
    assertEquals(3L, result.getTypeId());
    verify(productTypeRepository).findProductTypeByLabelIgnoreCase("NewType");
    verify(productTypeRepository).save(any(ProductType.class));
  }

  @Test
  void create_ShouldThrowExceptionWhenLabelIsBlank() {
    ProductTypeDto dto = new ProductTypeDto(null, "   ");

    BadRequestException exception = assertThrows(BadRequestException.class, () -> productTypeService.create(dto));
    assertEquals("Label is required", exception.getMessage());
    verify(productTypeRepository, never()).save(any());
  }
  @Test
  void create_ShouldReturnExistingProductTypeDtoWhenTypeAlreadyExists() {
    ProductTypeDto dto = new ProductTypeDto(null, "ExistingType");
    ProductType existingProductType = new ProductType();
    existingProductType.setTypeId(10L);
    existingProductType.setLabel("ExistingType");

    when(productTypeRepository.findProductTypeByLabelIgnoreCase("ExistingType")).thenReturn(existingProductType);

    assertThrows(ConflictException.class, ()-> productTypeService.create(dto));
    verify(productTypeRepository).findProductTypeByLabelIgnoreCase("ExistingType");
    verify(productTypeRepository, never()).save(any());
  }
  @Test
  void update_ShouldReturnUpdatedProductTypeDtoWhenValidData() {
    // Arrange
    Long id = 1L;
    ProductTypeDto dto = new ProductTypeDto(null, "UpdatedType");
    when(productTypeRepository.findById(id)).thenReturn(Optional.of(productType1));
    when(productTypeRepository.save(any(ProductType.class))).thenAnswer(invocation -> invocation.getArgument(0));

    // Act
    ProductTypeDto result = productTypeService.update(id, dto);

    // Assert
    assertNotNull(result);
    assertEquals("UpdatedType", result.getLabel());
    assertEquals(id, result.getTypeId());
    verify(productTypeRepository).findById(id);
    verify(productTypeRepository).save(productType1);
  }

  @Test
  void update_ShouldReturnNullWhenTypeNotFound() {
    // Arrange
    Long id = 99L;
    ProductTypeDto dto = new ProductTypeDto(null, "NonExistentType");
    when(productTypeRepository.findById(id)).thenReturn(Optional.empty());

    // Assert + act
    assertThrows(ResourceNotFoundException.class, ()-> productTypeService.update(id,dto));
    verify(productTypeRepository).findById(id);
    verify(productTypeRepository, never()).save(any());
  }

  @Test
  void update_ShouldThrowExceptionWhenLabelIsBlank() {
    Long id = 1L;
    ProductTypeDto dto = new ProductTypeDto(null, "   ");

    BadRequestException exception = assertThrows(
        BadRequestException.class, () -> productTypeService.update(id, dto));
    assertEquals("Label is required", exception.getMessage());
    verify(productTypeRepository, never()).save(any());
  }
}