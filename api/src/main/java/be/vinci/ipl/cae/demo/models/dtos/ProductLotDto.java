package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.ProductLot.State;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * simplified dto for product lot.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductLotDto {

  private Long lotId;
  private String productLabel;
  private String productType;
  private String imageUrl;
  private String producerEmail;
  private double unitPrice;
  private int remainingQuantity;
  private LocalDateTime availabilityDate;
  private String productUnit;
  private String productDescription;
  private int initialQuantity;
  private int soldQuantity;
  private int reservedQuantity;
  private State  productLotState;
  private String producerName;
}
