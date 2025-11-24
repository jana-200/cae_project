package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDate;
import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a reservation.
 */
@Data
@NoArgsConstructor
public class ReservationDto {

  private LocalDate recoveryDate;
  private List<ReservedProductsDto> reservedProducts;
}