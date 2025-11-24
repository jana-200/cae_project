package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 *  Product DTO.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductDto {

  private Long productId;


  private String label;


  private String type;


  private String description;

  private String unit;
}
