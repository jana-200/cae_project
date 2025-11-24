package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Product reservation entity.
 */
@Entity
@Table(name = "reservation_products")
@Data
@NoArgsConstructor
public class ProductReservation {

  @EmbeddedId
  private ProductReservationId id;

  @ManyToOne
  @MapsId("productLot")
  @JoinColumn(name = "product_lot", nullable = false)
  private ProductLot productLot;

  @ManyToOne
  @MapsId("reservation")
  @JoinColumn(name = "reservation", nullable = false)
  private Reservation reservation;

  @Column(nullable = false)
  private int quantity;
}
