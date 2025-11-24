package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * DTO for productType.
 */
@Data
@AllArgsConstructor
public class ProductTypeDto {
  private Long typeId;
  private String label;
}
