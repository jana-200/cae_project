package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.ReservationDto;
import be.vinci.ipl.cae.demo.models.dtos.ReservationInfo;
import be.vinci.ipl.cae.demo.models.dtos.ReservedProductsDto;
import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import be.vinci.ipl.cae.demo.models.entities.ProductReservation;
import be.vinci.ipl.cae.demo.models.entities.ProductReservationId;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.entities.User.Role;
import be.vinci.ipl.cae.demo.repositories.ProductLotRepository;
import be.vinci.ipl.cae.demo.repositories.ProductReservationRepository;
import be.vinci.ipl.cae.demo.repositories.ReservationRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * ReservationService service.
 */
@Service
public class ReservationService {

  private final ReservationRepository reservationRepository;
  private final ProductLotRepository productLotRepository;
  private final ProductReservationRepository productReservationRepository;

  /**
   * Constructor for ReservationService.
   *
   * @param reservationRepository        the repository used to handle reservation entities.
   * @param productLotRepository         the repository used to handle product lot entities.
   * @param productReservationRepository the repository used to handle product reservation
   *                                     entities.
   */
  public ReservationService(ReservationRepository reservationRepository,
      ProductLotRepository productLotRepository,
      ProductReservationRepository productReservationRepository) {
    this.reservationRepository = reservationRepository;
    this.productLotRepository = productLotRepository;
    this.productReservationRepository = productReservationRepository;
  }

  /**
   * Creates a new reservation with the specified details.
   *
   * @param reservationDto the reservation details.
   * @return true if the reservation was successfully created, false otherwise.
   */
  @Transactional
  public boolean createReservation(ReservationDto reservationDto) {
    User customer = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();

    Reservation reservation = new Reservation();
    reservation.setCustomer(customer);
    reservation.setState(Reservation.State.RESERVED);
    reservation.setReservationDate(LocalDateTime.now());
    reservation.setRecoveryDate(reservationDto.getRecoveryDate());

    List<ProductReservation> productReservations = new ArrayList<>();
    for (ReservedProductsDto reservedProduct : reservationDto.getReservedProducts()) {
      ProductLot productLot =
          productLotRepository.findByIdForUpdate(reservedProduct.getProductLotId())
          .orElseThrow(() ->
              new ResourceNotFoundException("Product lot not found "
                  + reservedProduct.getProductLotId()));

      if (productLot.getRemainingQuantity() < reservedProduct.getQuantity()) {
        throw new ConflictException("Insufficient quantity for product: " + productLot.getLotId());
      }
      productLot.setRemainingQuantity(productLot.getRemainingQuantity()
          - reservedProduct.getQuantity());
      productLot.setReservedQuantity(productLot.getReservedQuantity()
          + reservedProduct.getQuantity());

      if (productLot.getRemainingQuantity() == 0) {
        productLot.setState(ProductLot.State.SOLD_OUT);
      }
      productLotRepository.save(productLot);

    }

    reservationRepository.save(reservation);

    for (ReservedProductsDto reservedProduct : reservationDto.getReservedProducts()) {
      ProductLot productLot =
          productLotRepository.findByIdForUpdate(reservedProduct.getProductLotId())
          .orElseThrow(() ->
              new ResourceNotFoundException("Product lot not found for this id "
                  + reservedProduct.getProductLotId()));

      ProductReservation productReservation = new ProductReservation();
      productReservation.setId(new ProductReservationId(productLot.getLotId(),
          reservation.getReservationId()));
      productReservation.setProductLot(productLot);
      productReservation.setReservation(reservation);
      productReservation.setQuantity(reservedProduct.getQuantity());

      productReservations.add(productReservation);
    }

    productReservationRepository.saveAll(productReservations);
    return true;
  }


  /**
   * Converts a Reservation entity into a ReservationInfo DTO.
   * This method retrieves all the products associated with the given reservation, calculates the
   * total price of the reservation based on the unit price and quantity of each product, and
   * creates a ReservationInfo object containing the reservation details.
   *
   * @param reservation the Reservation entity to be converted.
   * @return a ReservationInfo object containing the reservation details and total price.
   */
  private ReservationInfo toReservationInfo(Reservation reservation) {
    List<ProductReservation> prs = productReservationRepository.findAllByReservation(reservation);
    double total = prs.stream()
        .mapToDouble(pr -> pr.getProductLot().getUnitPrice() * pr.getQuantity())
        .sum();

    User customer = reservation.getCustomer();

    return new ReservationInfo(
        reservation.getReservationId(),
        reservation.getReservationDate(),
        reservation.getRecoveryDate(),
        reservation.getState().toString(),
        total,
        customer.getEmail(),
        customer.getFirstname(),
        customer.getLastname()
    );
  }

  /**
   * Retrieves all reservations for the currently authenticated user, including total price.
   *
   * @return a list of ReservationInfo for the current user.
   */
  public List<ReservationInfo> getAllReservationsForCurrentUser() {
    User customer = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    List<Reservation> reservations = reservationRepository.findAllByCustomer(customer);
    return reservations.stream().map(this::toReservationInfo).toList();
  }

  /**
   * Cancels a reservation if it belongs to the authenticated user and is still in RESERVED state.
   *
   * @param reservationId the ID of the reservation to cancel.
   * @return true if the reservation was successfully cancelled, false otherwise.
   */
  @Transactional
  public boolean cancelReservation(Long reservationId) {
    User customer = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    Optional<Reservation> reservation = reservationRepository.findById(reservationId);

    if (reservation.isEmpty()) {
      throw new ResourceNotFoundException("Reservation not found");
    }

    Reservation res = reservation.get();

    if (!res.getCustomer().getUserId().equals(customer.getUserId())) {
      throw new AccessDeniedException("You are not allowed to cancel this reservation");
    }
    if (res.getState() != Reservation.State.RESERVED) {
      throw new
          ConflictException("Reservation cannot be cancelled because it is not in RESERVED state");
    }

    List<ProductReservation> productReservations =
        productReservationRepository.findAllByReservation(res);

    for (ProductReservation pr : productReservations) {
      ProductLot lot = pr.getProductLot();
      int quantity = pr.getQuantity();

      lot.setRemainingQuantity(lot.getRemainingQuantity() + quantity);
      lot.setReservedQuantity(lot.getReservedQuantity() - quantity);

      if (lot.getState() == ProductLot.State.SOLD_OUT) {
        lot.setState(ProductLot.State.FOR_SALE);
      }

      productLotRepository.save(lot);
    }
    res.setState(Reservation.State.CANCELED);
    reservationRepository.save(res);
    return true;
  }


  /**
   * Retrieves the details of the reserved products associated with a specific reservation.
   *
   * @param reservationId the unique identifier of the reservation
   * @return a list of ReservedProductsDto containing the details of each reserved product. Returns
   *        an empty list if no reservation is found with the given ID.
   */
  public List<ReservedProductsDto> getReservationDetailsById(long reservationId) {

    Optional<Reservation> reservation = reservationRepository.findById(reservationId);

    if (reservation.isEmpty()) {
      return new ArrayList<>();
    }

    User user = (User) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    if (!user.getRole().equals(Role.MANAGER)
        && !user.getUserId().equals(reservation.get().getCustomer().getUserId())) {
      throw new AccessDeniedException("You are not allowed to view this reservation");
    }

    return productReservationRepository.findAllByReservation(reservation.get()).stream()
        .map(pr -> {
          ReservedProductsDto dto = new ReservedProductsDto();
          dto.setProductLotId(pr.getProductLot().getLotId());
          dto.setProductLabel(pr.getProductLot().getProduct().getLabel());
          dto.setProductDescription(pr.getProductLot().getProduct().getDescription());
          dto.setProductUnit(pr.getProductLot().getProduct().getUnit().getLabel());
          dto.setUnitPrice(pr.getProductLot().getUnitPrice());
          dto.setQuantity(pr.getQuantity());
          return dto;
        })
        .toList();
  }


  /**
   * Retrieves all reservations made by all customers.
   * Intended for managers or volunteers, this method fetches
   * all reservations and maps them to ReservationInfo objects
   * containing key details and total price.
   *
   * @return a list of ReservationInfo for all reservations in the system
   */
  public List<ReservationInfo> getAllReservations() {
    List<Reservation> reservations = reservationRepository.findAll();
    return reservations.stream().map(this::toReservationInfo).toList();
  }


  /**
   * Updates the reservation state to ABANDONED or RETRIEVED and adjusts stock accordingly.
   * If ABANDONED, reserved quantities are returned to stock.
   * If RETRIEVED, reserved quantities are marked as sold.
   *
   * @param reservationId ID of the reservation to update
   * @param newState the new state ("ABANDONED" or "RETRIEVED")
   * @throws ResourceNotFoundException if the reservation does not exist
   * @throws BadRequestException if the newState is invalid
   */
  @Transactional
  public void updateReservationState(Long reservationId, String newState) {
    Reservation reservation = reservationRepository.findById(reservationId)
        .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

    Reservation.State targetState;
    try {
      targetState = Reservation.State.valueOf(newState.toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException e) {
      throw new BadRequestException("Invalid reservation state: " + newState, e);
    }

    if (targetState != Reservation.State.ABANDONED && targetState != Reservation.State.RETRIEVED) {
      throw new BadRequestException("State must be either ABANDONED or RETRIEVED.");
    }
    if (reservation.getState() != Reservation.State.RESERVED) {
      throw new BadRequestException("Only RESERVED reservations can be updated.");
    }

    List<ProductReservation> productReservations =
        productReservationRepository.findAllByReservation(reservation);

    for (ProductReservation pr : productReservations) {
      ProductLot lot = pr.getProductLot();
      int quantity = pr.getQuantity();

      lot.setReservedQuantity(lot.getReservedQuantity() - quantity);

      if (targetState == Reservation.State.ABANDONED) {
        lot.setRemainingQuantity(lot.getRemainingQuantity() + quantity);
        if (lot.getState() == ProductLot.State.SOLD_OUT) {
          lot.setState(ProductLot.State.FOR_SALE);
        }
      } else {
        lot.setSoldQuantity(lot.getSoldQuantity() + quantity);
      }

      productLotRepository.save(lot);
    }

    reservation.setState(targetState);
    reservationRepository.save(reservation);
  }
}
