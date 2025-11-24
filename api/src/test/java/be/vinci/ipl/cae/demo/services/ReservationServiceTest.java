package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.assertAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.ReservationDto;
import be.vinci.ipl.cae.demo.models.dtos.ReservedProductsDto;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import be.vinci.ipl.cae.demo.models.entities.ProductReservation;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.Unit;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.entities.User.Role;
import be.vinci.ipl.cae.demo.repositories.ProductLotRepository;
import be.vinci.ipl.cae.demo.repositories.ProductReservationRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

  @Mock
  private ReservationRepository reservationRepository;
  @Mock
  private ProductLotRepository productLotRepository;
  @Mock
  private ProductReservationRepository productReservationRepository;
  @InjectMocks
  private ReservationService reservationService;

  private User user;
  private ProductLot lot1;
  private ProductLot lot2;

  @BeforeEach
  void setUp() {
    user = new User();
    user.setUserId(1L);
    SecurityContextHolder.getContext()
        .setAuthentication(new TestingAuthenticationToken(user, null));
    user.setUserId(42L);
    user.setRole(Role.CUSTOMER);

    lot1 = new ProductLot();
    lot1.setLotId(1L);
    lot1.setRemainingQuantity(10);
    lot1.setReservedQuantity(0);
    lot1.setState(ProductLot.State.FOR_SALE);

    lot2 = new ProductLot();
    lot2.setLotId(2L);
    lot2.setRemainingQuantity(5);
    lot2.setReservedQuantity(0);
    lot2.setState(ProductLot.State.FOR_SALE);
  }

  @Test
  void createReservation_successfully() {
    ReservedProductsDto p1 = new ReservedProductsDto();
    p1.setQuantity(2);
    p1.setProductLotId(1L);
    ReservedProductsDto p2 = new ReservedProductsDto();
    p2.setQuantity(3);
    p2.setProductLotId(2L);
    ReservationDto dto = new ReservationDto();
    LocalDate recuperationDate = LocalDate.now().plusDays(1);
    List<ReservedProductsDto> reservedProducts=List.of(p1, p2);
    dto.setReservedProducts(reservedProducts);
    dto.setRecoveryDate(recuperationDate);
    when(productLotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(lot1));
    when(productLotRepository.findByIdForUpdate(2L)).thenReturn(Optional.of(lot2));

    boolean result = reservationService.createReservation(dto);

    assertTrue(result);
    verify(reservationRepository).save(any());
    verify(productLotRepository, times(2)).save(any());
    verify(productReservationRepository).saveAll(any());
  }

  @Test
  void createReservation_shouldThrowIfNotEnoughQuantity() {
    ReservedProductsDto p1 = new ReservedProductsDto();
    p1.setQuantity(10);
    p1.setProductLotId(1L);

    lot1.setRemainingQuantity(5);

    ReservationDto dto = new ReservationDto();
    dto.setRecoveryDate(LocalDate.now().plusDays(1));
    dto.setReservedProducts(List.of(p1));

    when(productLotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(lot1));

    RuntimeException exception = assertThrows(RuntimeException.class, () -> {
      reservationService.createReservation(dto);
    });


    assertTrue(exception.getMessage().contains("Insufficient quantity"));

    verify(reservationRepository, never()).save(any());
    verify(productLotRepository, never()).save(any());
    verify(productReservationRepository, never()).saveAll(any());
  }
  @Test
  void createReservation_shouldSetSoldOutWhenRemainingIsZero() {
    ReservedProductsDto p1 = new ReservedProductsDto();
    p1.setQuantity(5);
    p1.setProductLotId(1L);

    lot1.setRemainingQuantity(5);

    ReservationDto dto = new ReservationDto();
    dto.setRecoveryDate(LocalDate.now().plusDays(1));
    dto.setReservedProducts(List.of(p1));

    when(productLotRepository.findByIdForUpdate(1L)).thenReturn(Optional.of(lot1));

    boolean result = reservationService.createReservation(dto);

    assertAll(
        () -> assertEquals(0, lot1.getRemainingQuantity()),
        () -> assertEquals(ProductLot.State.SOLD_OUT, lot1.getState()),
        () -> assertTrue(result)
    );
  }
  @Test
  void cancelReservation_shouldThrowResourceNotFoundExceptionWhenNotFound() {
    when(reservationRepository.findById(99L)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> {
      reservationService.cancelReservation(99L);
    });
  }

  @Test
  void cancelReservation_shouldSucceedWhenReservationIsValid() {
    Reservation reservation = new Reservation();
    reservation.setReservationId(1L);
    reservation.setCustomer(user);
    reservation.setState(Reservation.State.RESERVED);

    lot1.setReservedQuantity(2);
    lot1.setRemainingQuantity(3);

    ProductReservation pr = new ProductReservation();
    pr.setProductLot(lot1);
    pr.setQuantity(2);

    when(reservationRepository.findById(1L)).thenReturn(Optional.of(reservation));
    when(productReservationRepository.findAllByReservation(reservation)).thenReturn(List.of(pr));

    boolean result = reservationService.cancelReservation(1L);
    assertAll(()-> assertTrue(result),
        ()->  assertEquals(5, lot1.getRemainingQuantity()),
        ()->  assertEquals(0, lot1.getReservedQuantity()),
        ()-> assertEquals(Reservation.State.CANCELED, reservation.getState()));
    verify(productLotRepository).save(lot1);
    verify(reservationRepository).save(reservation);
  }
  @Test
  void cancelReservation_shouldThrowAccessDeniedExceptionIfUserNotOwner() {

    Reservation reservation = new Reservation();
    reservation.setReservationId(2L);
    User anotherUser = new User();
    anotherUser.setUserId(42L);
    reservation.setCustomer(anotherUser);
    reservation.setState(Reservation.State.RESERVED);
    User loggedUser = new User();
    loggedUser.setUserId(1L);

    var authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn(loggedUser);
    var securityContext = mock(SecurityContext.class);
    when(securityContext.getAuthentication()).thenReturn(authentication);
    SecurityContextHolder.setContext(securityContext);

    when(reservationRepository.findById(2L)).thenReturn(Optional.of(reservation));

    assertThrows(AccessDeniedException.class, () -> {
      reservationService.cancelReservation(2L);
    });
  }
  @Test
  void cancelReservation_shouldThrowConflictExceptionIfStateIsNotReserved() {
    User loggedUser = new User();
    loggedUser.setUserId(1L);
    Reservation reservation = new Reservation();
    reservation.setReservationId(3L);
    reservation.setCustomer(loggedUser);
    reservation.setState(Reservation.State.CANCELED);

    var authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn(loggedUser);
    var securityContext = mock(SecurityContext.class);
    when(securityContext.getAuthentication()).thenReturn(authentication);
    SecurityContextHolder.setContext(securityContext);
    when(reservationRepository.findById(3L)).thenReturn(Optional.of(reservation));

    assertThrows(ConflictException.class, () -> {
      reservationService.cancelReservation(3L);
    });
  }
  @Test
  void getAllReservationsForCurrentUser_shouldReturnListWithTotalPrice() {
    Reservation reservation = new Reservation();
    reservation.setReservationId(1L);
    reservation.setCustomer(user);
    reservation.setReservationDate(LocalDateTime.now());
    reservation.setRecoveryDate(LocalDate.now().plusDays(3));
    reservation.setState(Reservation.State.RESERVED);

    ProductReservation pr1 = new ProductReservation();
    pr1.setQuantity(2);
    ProductLot lotA = new ProductLot();
    lotA.setUnitPrice(3.5);
    pr1.setProductLot(lotA);

    ProductReservation pr2 = new ProductReservation();
    pr2.setQuantity(1);
    ProductLot lotB = new ProductLot();
    lotB.setUnitPrice(2.0);
    pr2.setProductLot(lotB);

    when(reservationRepository.findAllByCustomer(any(User.class))).thenReturn(List.of(reservation));
    when(productReservationRepository.findAllByReservation(reservation)).thenReturn(List.of(pr1, pr2));

    var result = reservationService.getAllReservationsForCurrentUser();
    assertAll(()->
    assertEquals(1, result.size()),
        ()-> assertEquals(9.0, result.get(0).getTotalPrice()));
  }
  @Test
  void getReservationDetailsById_shouldReturnReservedProducts() {

    Reservation reservation = new Reservation();
    reservation.setReservationId(5L);
    reservation.setCustomer(user);
    user.setRole(Role.MANAGER);

    ProductLot lot = new ProductLot();
    lot.setLotId(10L);
    lot.setUnitPrice(5.0);

    Product product = new Product();
    product.setLabel("Tomato");
    product.setDescription("Fresh tomatoes");
    Unit unit = new Unit();
    unit.setLabel("kg");
    product.setUnit(unit);
    lot.setProduct(product);

    ProductReservation pr = new ProductReservation();
    pr.setProductLot(lot);
    pr.setQuantity(3);
    pr.setReservation(reservation);

    var authentication = mock(Authentication.class);
    when(authentication.getPrincipal()).thenReturn(user);
    var securityContext = mock(SecurityContext.class);
    when(securityContext.getAuthentication()).thenReturn(authentication);
    SecurityContextHolder.setContext(securityContext);

    when(reservationRepository.findById(5L)).thenReturn(Optional.of(reservation));
    when(productReservationRepository.findAllByReservation(reservation)).thenReturn(List.of(pr));

    var result = reservationService.getReservationDetailsById(5L);
    assertAll(()->
    assertEquals(1, result.size()),
        ()->  assertEquals("Tomato", result.get(0).getProductLabel()),
        ()->  assertEquals("kg", result.get(0).getProductUnit()),
        ()->  assertEquals(5.0, result.get(0).getUnitPrice()),
        ()->  assertEquals(3, result.get(0).getQuantity()));
  }
  @Test
  void getReservationDetailsById_shouldReturnEmptyList() {
    when(reservationRepository.findById(99L)).thenReturn(Optional.empty());
    var result = reservationService.getReservationDetailsById(99L);
    assertEquals(0, result.size());

  }


}