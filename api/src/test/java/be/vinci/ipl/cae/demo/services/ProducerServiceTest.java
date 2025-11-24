package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.ProducerDto;
import be.vinci.ipl.cae.demo.models.dtos.ProductLotDto;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.entities.User.Role;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.ProductLotRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProducerServiceTest {

  @Mock
  private ProducerRepository producerRepository;

  @Mock
  private ProductLotRepository productLotRepository;

  @Mock
  private UserRepository userRepository;
  @Mock
  private HelperService helperService;

  @InjectMocks
  private ProducerService producerService;

  private Producer producer;
  private User user;
  private ProductLot productLot;

  @BeforeEach
  void setUp() {
    producer = new Producer();
    producer.setUserId(1L);
    producer.setCompanyName("Company Producer");

    user = new User();
    user.setUserId(1L);
    user.setEmail("producer@example.com");
    user.setRole(Role.PRODUCER);


    productLot = new ProductLot();
    productLot.setLotId(1L);
    productLot.setRemainingQuantity(10);
    productLot.setProducer(producer);
  }

  @Test
  void findById_ShouldReturnProducerWhenExists() {
    // Arrange
    Long testId = producer.getUserId();
    when(producerRepository.findById(testId))
        .thenReturn(Optional.of(producer));

    // Act
    Producer result = producerService.findById(testId);

    // Assert
    assertAll(
      () -> assertNotNull(result),
      () -> assertEquals(testId, result.getUserId())
    );
    verify(producerRepository).findById(testId);
  }

  @Test
  void findById_ShouldReturnNullWhenNotExists() {
    // Arrange
    when(producerRepository.findById(2L))
        .thenReturn(Optional.empty());

    // Act
    Producer result = producerService.findById(2L);

    // Assert
    assertNull(result);

  }

  @Test
  void findById_ShouldReturnNullForNullInput() {
    // Act
    Producer result = producerService.findById(null);

    // Assert
    assertNull(result);

  }

  @Test
  void findLotsByProducer_ShouldReturnEmptyListWhenNoLotsFound() {
    // Arrange
    when(userRepository.findByEmail(user.getEmail())).thenReturn(user);
    when(productLotRepository.findByProducerUserId(user.getUserId())).thenReturn(List.of());

    // Act
    List<ProductLotDto> result = producerService.findLotsByProducer(user.getEmail());

    // Assert
    assertNotNull(result);
    assertTrue(result.isEmpty());
    verify(userRepository).findByEmail(user.getEmail());
    verify(productLotRepository).findByProducerUserId(user.getUserId());
  }

  @Test
  void findLotsByProducer_ShouldThrowExceptionWhenUserNotFound() {
    // Arrange
    when(userRepository.findByEmail(user.getEmail())).thenReturn(null);

    // Act & Assert
    assertThrows(ResourceNotFoundException.class, () -> producerService.findLotsByProducer(user.getEmail()));
    verify(userRepository).findByEmail(user.getEmail());
    verify(productLotRepository, never()).findByProducerUserId(anyLong());
  }

  @Test
  void findAll_ShouldReturnProducerDtos() {
    user.setFirstname("Alicia");
    user.setLastname("Dove");
    user.setEmail("alicia@example.com");
    user.setDeactivated(false);
    producer.setUser(user);

    when(producerRepository.findAll()).thenReturn(List.of(producer));

    List<ProducerDto> result = producerService.findAll();

    assertEquals(1, result.size());
    ProducerDto dto = result.get(0);
    assertEquals("Company Producer", dto.getCompanyName());
    assertEquals("Alicia", dto.getFirstname());
    assertEquals("Dove", dto.getLastname());
    assertEquals("alicia@example.com", dto.getEmail());
    assertFalse(dto.isDeactivated());
  }

}


