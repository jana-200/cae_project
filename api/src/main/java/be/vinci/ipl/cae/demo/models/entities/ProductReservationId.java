package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Composite primary key for a product reservation.
 * Contains both the product lot ID and the reservation ID.
 */
@Embeddable
@Data
@NoArgsConstructor
public class ProductReservationId implements Serializable {

  private Long reservation;
  private Long productLot;

  /**
   * Constructor with parameters.
   *
   * @param productLot  the ID of the product lot
   * @param reservation the ID of the reservation
   */
  public ProductReservationId(Long productLot, Long reservation) {
    this.productLot = productLot;
    this.reservation = reservation;
  }
}