package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Products entity.
 */
@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
public class Product {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long productId;

  @Column(unique = true, nullable = false)
  private String label;

  @ManyToOne
  @JoinColumn(name = "type")
  private ProductType type;

  @Column(nullable = false)
  private String description;

  @ManyToOne
  @JoinColumn(name = "unit")
  private Unit unit;
}
