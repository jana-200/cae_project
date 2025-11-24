package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Product types entity.
 */
@Entity
@Table(name = "product_types")
@Data
@NoArgsConstructor
public class ProductType {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long typeId;

  @Column(unique = true, nullable = false)
  private String label;
}
