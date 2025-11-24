package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.ProductLot.State;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * NewProdutLot DTO.
 */
@Data
@NoArgsConstructor
public class NewProductLot {

  private Long product;
  private String productLabel;
  private String productType;
  private String productDescription;
  private Long producer;
  private String producerEmail;
  private double unitPrice;
  private int initialQuantity;
  private LocalDateTime availabilityDate;
  private State productLotState;
  private String unit;


}
