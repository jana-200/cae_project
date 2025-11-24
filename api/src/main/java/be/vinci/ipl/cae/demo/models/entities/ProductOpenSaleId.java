package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Composite primary key for a product open sale.
 * Contains both the product lot ID and the open sale ID.
 */
@Embeddable
@Data
@NoArgsConstructor
public class ProductOpenSaleId implements Serializable {
  private Long openSale;
  private Long productLot;
    
  /**
   * Constructor with parameters.
   *
   * @param productLot  the ID of the product lot
   * @param openSale the ID of the open sale
   */
  public ProductOpenSaleId(Long productLot, Long openSale) {
    this.productLot = productLot;
    this.openSale = openSale;
  }
}
