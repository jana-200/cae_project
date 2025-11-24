package be.vinci.ipl.cae.demo.models.dtos;

import java.util.List;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating an Open sale.
 */
@Data
@NoArgsConstructor
public class OpenSaleDto {
    
  private List<OpenSaleProductDto> reservedProducts;
}
