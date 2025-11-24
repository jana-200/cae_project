package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * DTO representing a product in an open sale.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OpenSaleProductDto {

  private Long productLotId;
  private String productLabel;
  private String productDescription;
  private String productUnit;
  private double unitPrice;
  private int quantity;
    
}


