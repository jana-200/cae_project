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
 * Product photos entity.
 */
@Entity
@Table(name = "product_images")
@Data
@NoArgsConstructor
public class ProductImage {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long imageId;

  @ManyToOne
  @JoinColumn(name = "product")
  private Product product;

  @Column(nullable = false, unique = true)
  private String url;
}
