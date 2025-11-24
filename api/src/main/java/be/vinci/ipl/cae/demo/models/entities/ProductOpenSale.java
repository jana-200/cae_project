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
 * Product open sale entity.
 */
@Entity
@Table(name = "open_sale_products")
@Data
@NoArgsConstructor
public class ProductOpenSale {

  @EmbeddedId
  private ProductOpenSaleId id;

  @ManyToOne
  @MapsId("productLot")
  @JoinColumn(name = "product_lot", nullable = false)
  private ProductLot productLot;

  @ManyToOne
  @MapsId("openSale")
  @JoinColumn(name = "open_sale_id", nullable = false)
  private OpenSale openSale;

  @Column(nullable = false)
  private int quantity;
    
}

