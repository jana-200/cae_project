package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Reservation entity.
 */
@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
public class Reservation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long reservationId;

  @ManyToOne
  @JoinColumn(name = "customer")
  private User customer;

  @Column(nullable = false)
  private LocalDate recoveryDate;

  @Column(nullable = false)
  private LocalDateTime reservationDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private State state;

  /**
   * Reservation state.
   */
  public enum State {
    RESERVED,
    CANCELED,
    ABANDONED,
    RETRIEVED
  }
}
