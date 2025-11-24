package be.vinci.ipl.cae.demo.models.dtos;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *  OpenSale info.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class OpenSaleInfo {

  private Long openSaleId;
  private int totalPrice;
  private String openSaleDate;
  
}
