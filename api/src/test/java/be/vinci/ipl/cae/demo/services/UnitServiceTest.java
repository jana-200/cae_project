package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.models.entities.Unit;
import be.vinci.ipl.cae.demo.repositories.UnitRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class UnitServiceTest {

  @Mock
  private UnitRepository unitRepository;

  @InjectMocks
  private UnitService unitService;

  private Unit testUnit;

  @BeforeEach
  void setUp() {
    testUnit = new Unit();
    testUnit.setLabel("kg");
    testUnit.setUnitId(1L);
  }

  @Test
  void findByLabelWhenUnitExists() {
    // Arrange
    when(unitRepository.findByLabelIgnoreCase("kg")).thenReturn(testUnit);

    // Act
    Unit result = unitService.findByLabel("kg");

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals("kg", result.getLabel())
    );
    verify(unitRepository, times(1)).findByLabelIgnoreCase("kg");
  }

  @Test
  void findByLabelWhenUnitNotExists() {
    // Arrange
    when(unitRepository.findByLabelIgnoreCase("unknown")).thenReturn(null);

    // Act
    Unit result = unitService.findByLabel("unknown");

    // Assert
    assertNull(result);
    verify(unitRepository, times(1)).findByLabelIgnoreCase("unknown");
  }

  @Test
  void createUnitSuccessfully() {
    // Arrange
    when(unitRepository.save(any(Unit.class))).thenReturn(testUnit);

    // Act
    Unit result = unitService.create("kg");

    // Assert
    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals("kg", result.getLabel())
    );
    verify(unitRepository, times(1)).save(any(Unit.class));
  }

  @Test
  void createUnitWithEmptyLabel() {
    // Act & Assert

    Unit result = unitService.findByLabel("");

    assertNull(result);
    verify(unitRepository, never()).save(any());
  }

  @Test
  void createUnitWithNullLabel() {
    // Act & Assert

    Unit result = unitService.create(null);

    assertNull(result);
    verify(unitRepository, never()).save(any());
  }
  @Test
  void createUnitWithBlankLabelOnlySpaces() {
    // Act
    Unit result = unitService.create("   ");

    // Assert
    assertNull(result);
    verify(unitRepository, never()).save(any());
  }


}