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
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ProductLots entity.
 */
@Entity
@Table(name = "product_lots")
@Data
@NoArgsConstructor
public class ProductLot {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long lotId;

  @ManyToOne
  @JoinColumn(name = "product")
  private Product product;

  @ManyToOne
  @JoinColumn(name = "producer")
  private Producer producer;

  @ManyToOne
  @JoinColumn(name = "image")
  private ProductImage image;

  @Column(nullable = false)
  private double unitPrice;

  @Column(nullable = false)
  private int initialQuantity;

  @Column(nullable = true)
  private int soldQuantity;

  @Column(nullable = true)
  private int remainingQuantity;

  @Column(nullable = true)
  private int reservedQuantity;

  @Column(nullable = true)
  private int removedQuantity;

  @ManyToOne
  @JoinColumn(name = "responsible_manager")
  private User responsibleManager;

  @Column(nullable = false)
  private LocalDateTime proposalDate;

  @Column(nullable = false)
  private LocalDateTime availabilityDate;

  @Column
  private LocalDateTime receiptDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private State state;

  /**
   * State of a product lot.
   */
  public enum State {
    PENDING,
    ACCEPTED,
    REJECTED,
    FOR_SALE,
    SOLD_OUT,
  }
}
