package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.models.dtos.OpenSaleDto;
import be.vinci.ipl.cae.demo.services.OpenSaleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * ProductController to handle lots.
 */
@RestController
@RequestMapping("/open_sales")
@CrossOrigin(origins = "http://localhost:5173")
public class OpenSaleController {

  private final OpenSaleService openSaleService;


  /**
   * Constructor for OpenSaleController.
   *
   * @param openSaleService the service to handle open sales-related operations
   */
  public OpenSaleController(OpenSaleService openSaleService) {
    this.openSaleService = openSaleService;
  }

  private boolean isInvalidOpenSale(OpenSaleDto openSaleDto) {
    return openSaleDto == null || openSaleDto.getReservedProducts() == null
        || openSaleDto.getReservedProducts().isEmpty()
        || openSaleDto.getReservedProducts().stream()
        .anyMatch(reservedProduct -> reservedProduct.getProductLotId() == null
            || reservedProduct.getQuantity() <= 0); 
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Create an open sales for a product lot",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = "Sale Successfully created"),
      @ApiResponse(responseCode = "403", description = "Forbidden – missing or invalid token "
          + "must be a manager"),
      @ApiResponse(responseCode = "401", description = "User must be authenticated"),
      @ApiResponse(responseCode = "404", description = "Product Lot Not found"),
      @ApiResponse(responseCode = "400", description = "Bad Request - Invalid input"),
      @ApiResponse(responseCode = "409",
          description = "Product lot must be for sale and with sufficient quantity"),
  })
  @PostMapping("/")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public boolean createAnOpenSale(@RequestBody OpenSaleDto openSaleDto) {
    if (isInvalidOpenSale(openSaleDto)) {
      throw new BadRequestException("Invalid open sale");
    }
    return openSaleService.createOpenSale(openSaleDto);
  }
}
