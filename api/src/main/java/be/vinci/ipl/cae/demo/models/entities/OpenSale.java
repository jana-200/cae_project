package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Open Sale entity.
 */
@Entity
@Table(name = "openSales")
@Data
@NoArgsConstructor
public class OpenSale {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long openSaleId;

  @Column(nullable = false)
  private LocalDateTime openSaleDate;

}


