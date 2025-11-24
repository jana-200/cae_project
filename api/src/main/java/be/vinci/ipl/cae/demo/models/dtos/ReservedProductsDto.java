package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO representing a reserved product in a reservation.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservedProductsDto {

  private Long productLotId;
  private String productLabel;
  private String productDescription;
  private String productUnit;
  private double unitPrice;
  private int quantity;
}

