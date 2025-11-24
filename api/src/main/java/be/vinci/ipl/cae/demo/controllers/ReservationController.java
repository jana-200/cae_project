package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.models.dtos.ReservationDto;
import be.vinci.ipl.cae.demo.models.dtos.ReservationInfo;
import be.vinci.ipl.cae.demo.models.dtos.ReservedProductsDto;
import be.vinci.ipl.cae.demo.services.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.time.LocalDate;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller to handle reservations.
 */
@RestController
@RequestMapping("/reservations")
public class ReservationController {

  private final ReservationService reservationService;

  /**
   * Constructor for the reservation controller.
   *
   * @param reservationService the injected reservationService.
   */
  public ReservationController(ReservationService reservationService) {
    this.reservationService = reservationService;
  }

  private boolean isInvalidReservation(ReservationDto reservationDto) {
    return reservationDto == null || reservationDto.getRecoveryDate() == null
        || reservationDto.getReservedProducts() == null
        || reservationDto.getRecoveryDate().isBefore(LocalDate.now())
        || reservationDto.getReservedProducts().isEmpty();
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Create a reservation.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "CREATED"),
      @ApiResponse(responseCode = "409", description = "Not enough remaining products"),
      @ApiResponse(responseCode = "400", description = "Bad request"),
      @ApiResponse(responseCode = "404", description = "Product lot not found"),
      @ApiResponse(responseCode = "403", description = "Forbidden – missing or invalid token"),
      @ApiResponse(responseCode = "401", description = "Must be authenticated"),
  })
  @PostMapping
  @PreAuthorize("hasRole('ROLE_CUSTOMER')")
  public void createReservation(@RequestBody ReservationDto reservationDto) {
    if (isInvalidReservation(reservationDto)) {
      throw new BadRequestException("Invalid reservation");
    }
    reservationService.createReservation(reservationDto);
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Get all reservations for current user.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK"),
      @ApiResponse(responseCode = "401", description = "Unauthorized"),
      @ApiResponse(responseCode = "403", description = "Forbidden not a customer"),
  })
  @GetMapping
  @PreAuthorize("hasRole('ROLE_CUSTOMER')")
  public List<ReservationInfo> getAllReservationsForCurrentUser() {
    return reservationService.getAllReservationsForCurrentUser();
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Delete a reservation by ID",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Reservation successfully deleted"),
      @ApiResponse(responseCode = "404", description = "Reservation not found"),
      @ApiResponse(responseCode = "401", description = "Unauthorized"),
      @ApiResponse(responseCode = "400", description = "Bad request"),
      @ApiResponse(responseCode = "403",
          description = "Forbidden: Not the owner of the reservation"),
      @ApiResponse(responseCode = "409",
          description = "Conflict: Reservation cannot be cancelled"),
  })
  @DeleteMapping("/{reservationId}")
  @PreAuthorize("hasRole('ROLE_CUSTOMER')")
  public void deleteReservation(@PathVariable("reservationId") Long reservationId) {
    if (reservationId <= 0) {
      throw new BadRequestException("Invalid reservation Id ");
    }
    reservationService.cancelReservation(reservationId);
  }


  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @GetMapping("/{id}")
  @Operation(summary = "Get a reservation by ID",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK"),
      @ApiResponse(responseCode = "404", description = "Not Found"),
      @ApiResponse(responseCode = "400", description = "invalid reservationId"),
      @ApiResponse(responseCode = "401", description = "Unauthorized"),
      @ApiResponse(responseCode = "403",
          description = "Forbidden: Not the owner of the reservation or a manager"),
      @ApiResponse(responseCode = "401", description = "Must be authenticated"),


  })
  @PreAuthorize("isAuthenticated()")
  public List<ReservedProductsDto> getReservationById(@PathVariable("id") Long id) {
    if (id <= 0) {
      throw new BadRequestException("invalid reservationId");
    }
    return reservationService.getReservationDetailsById(id);
  }


  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @GetMapping("/all")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  @Operation(summary = "Get all reservations for all clients.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "OK"),
      @ApiResponse(responseCode = "403", description = "Forbidden: Not authorized"),
      @ApiResponse(responseCode = "401", description = "Must be authenticated"),
  })
  public List<ReservationInfo> getAllReservations() {
    return reservationService.getAllReservations();
  }


  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @PatchMapping("/{id}/state")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  @Operation(summary = "Update the state of a reservation",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "State updated successfully"),
      @ApiResponse(responseCode = "404", description = "Reservation not found"),
      @ApiResponse(responseCode = "400", description = "Invalid state: must be either"
          + " ABANDONED or RETRIEVED / invalid Id"),
      @ApiResponse(responseCode = "403", description = "Forbidden: Not authorized"),
      @ApiResponse(responseCode = "401", description = "Must be authenticated"),
  })
  public void updateReservationState(@PathVariable Long id, @RequestParam String newState) {
    if (newState == null || newState.isBlank()) {
      throw new BadRequestException("Invalid state");
    }
    reservationService.updateReservationState(id, newState);
  }

}
