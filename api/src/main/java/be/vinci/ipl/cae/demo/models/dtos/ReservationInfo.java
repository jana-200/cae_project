package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO for all reservation.
 */
@Data
@AllArgsConstructor
public class ReservationInfo {

  private Long reservationId;
  private LocalDateTime reservationDate;
  private LocalDate recoveryDate;
  private String state;
  private double totalPrice;
  private String customerEmail;
  private String customerFirstname;
  private String customerLastname;
}
