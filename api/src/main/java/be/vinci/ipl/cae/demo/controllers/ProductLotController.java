package be.vinci.ipl.cae.demo.controllers;


import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewProductLot;
import be.vinci.ipl.cae.demo.models.dtos.ProductLotDto;
import be.vinci.ipl.cae.demo.models.entities.ProductLot.State;
import be.vinci.ipl.cae.demo.services.OpenSaleService;
import be.vinci.ipl.cae.demo.services.ProductLotService;
import be.vinci.ipl.cae.demo.services.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

/**
 * ProductLotController to handle product lots .
 */
@RestController
@RequestMapping("/product-lots")
public class ProductLotController {


  private final ProductLotService productLotService;
  private final ProductService productService;
  private final OpenSaleService openSaleService;

  /**
   * Constructor for the product lot controller.
   *
   * @param productLotService the injected productLotService.
   */
  public ProductLotController(ProductLotService productLotService, ProductService productService, 
      OpenSaleService openSaleService) {
    this.productLotService = productLotService;
    this.productService = productService;
    this.openSaleService = openSaleService;
  }

  /**
   * Checks whether the provided new lot information is invalid.
   *
   * @param newLot The new product lot data to validate.
   * @return true if any required field is null or blank, false otherwise.
   */
  private boolean isValidNewProductLot(NewProductLot newLot, MultipartFile image) {
    return newLot != null
        && newLot.getProductLabel() != null && !newLot.getProductLabel().isBlank()
        && newLot.getProductType() != null && !newLot.getProductType().isBlank()
        && newLot.getProducer() != null
        && newLot.getUnit() != null && !newLot.getUnit().isBlank()
        && newLot.getProductDescription() != null && !newLot.getProductDescription().isBlank()
        && newLot.getUnitPrice() > 0
        && newLot.getInitialQuantity() > 0
        && newLot.getAvailabilityDate() != null
        && newLot.getAvailabilityDate().isAfter(LocalDateTime.now())
        && image != null && !image.isEmpty();
  }

  /**
   * Retrieves product lots filtered by state (optional email for producer-specific filtering).
   */
  @Operation(summary = "Retrieves product lots filtered by state.")
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "List of product lots based on state"),
      @ApiResponse(responseCode = "400", description = "Bad Request - Invalid State"),
  })
  @GetMapping("/")
  public List<ProductLotDto> getLotsByState(
      @RequestParam(required = false) String state,
      @RequestParam(required = false) String email
  ) {
    if (state == null || state.isEmpty()) {
      return productLotService.findAllOrderedByState();
    }
    State lotState;
    try {
      lotState = State.valueOf(state.toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException e) {
      throw new BadRequestException("Invalid state value: " + state, e);
    }
    if (email != null && !email.isEmpty()) {
      return productLotService.findLotsForProducer(email, lotState);
    }

    return productLotService.findProductLotByState(lotState);

  }

  /**
   * Retrieves the most recent product lots for sale.
   */
  @GetMapping("/recent")
  public List<ProductLotDto> getRecentLotsForSale() {
    return productLotService.findRecentLotsForSale();
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Creates a new product Lot and a new product if not existing.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "201", description = " Lot created successfully"),
      @ApiResponse(responseCode = "400", description = "Invalid or missing input data"),
      @ApiResponse(responseCode = "403",
          description = "User is not authenticated or not a producer"),
      @ApiResponse(responseCode = "401", description = "Producer must be authenticated"),
      @ApiResponse(responseCode = "404", description = "Producer not found"),
  })
  @CrossOrigin(origins = "http://localhost:5173")
  @PostMapping("/")
  @PreAuthorize("hasRole('ROLE_PRODUCER')")
  @ResponseStatus(HttpStatus.CREATED)
  public NewProductLot createProductLot(@RequestPart("NewProductLot") NewProductLot newLot,
      @RequestPart(value = "image", required = false) MultipartFile image) {
    if (!isValidNewProductLot(newLot, image)) {
      throw new BadRequestException("Invalid or missing input data");
    }

    NewProductLot created = productLotService.add(newLot, image);

    if (created == null) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST);
    }

    return created;
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Retrieves a product lot by its ID.")
  @ApiResponses({
      @ApiResponse(responseCode = "200",
          description = " The product with the corresponding ID "),
      @ApiResponse(responseCode = "404",
          description = " Product lot not found with the corresponding ID "),
      @ApiResponse(responseCode = "400", description = "Invalid ID"),
  })
  @GetMapping("/{id}")
  @ResponseStatus(HttpStatus.OK)
  public ProductLotDto getProductLotById(@PathVariable("id") Long id) {

    return productLotService.getProductLotById(id);
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Updates the image of a product lot.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = " lot Image updated successfully"),
      @ApiResponse(responseCode = "404", description = "Product lot not found with the ID"),
      @ApiResponse(responseCode = "400", description = "Image is missing or invalid id"),
      @ApiResponse(responseCode = "403",
          description = "User is not authorized"),
      @ApiResponse(responseCode = "401", description = "Producer must be authenticated"),

  })
  @PutMapping("/{id}/image")
  @PreAuthorize("hasRole('ROLE_PRODUCER')")
  @ResponseStatus(HttpStatus.OK)
  public void updateProductLotImage(@PathVariable("id") Long id,
      @RequestParam(value = "image", required = false) MultipartFile image) {

    if (image == null || image.isEmpty()) {
      throw new BadRequestException("Image is missing");
    }

    boolean isUpdated = productLotService.updateProductLotImage(id, image);

    if (!isUpdated) {
      throw new ResourceNotFoundException("Product lot image not found with ID: " + id);
    }

  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Updates the state of a product lot.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "State updated"),
      @ApiResponse(responseCode = "404", description = "Lot not found"),
      @ApiResponse(responseCode = "400", description = "Missing or Invalid state "
          + "/ Id must be a valid number"),
      @ApiResponse(responseCode = "403",
          description = "User is not authenticated or not authorized"),
      @ApiResponse(responseCode = "401", description = "User must be authenticated"),

  })
  @CrossOrigin(origins = "http://localhost:5173")
  @PutMapping("/{id}/state")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  @ResponseStatus(HttpStatus.OK)
  public void updateLotState(@PathVariable("id") Long id, @RequestParam String newState) {

    if (newState == null || newState.isBlank()) {
      throw new BadRequestException("State is required");
    }

    State state;
    try {
      state = State.valueOf(newState.toUpperCase(Locale.ROOT));
    } catch (IllegalArgumentException e) {
      throw new BadRequestException("Invalid state value: " + newState, e);
    }

    boolean isUpdated = productLotService.updateLotState(id, state);

    if (!isUpdated) {
      throw new ResourceNotFoundException("Product lot state not found with ID: " + id);
    }
  }

  /**
   * Merges two maps by summing the values of common keys.
   *
   * @param map1 the first map
   * @param map2 the second map
   * @return a new map with merged values
   */
  private Map<String, Integer> mergeMaps(Map<String, Integer> map1, Map<String, Integer> map2) {
    Map<String, Integer> result = new HashMap<>(map1);
    map2.forEach((key, value) -> result.merge(key, value, Integer::sum));
    return result;
  }


  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Get sales statistics for a specific product, month, and year.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Sales statistics retrieved successfully"),
      @ApiResponse(responseCode = "400", description = "Invalid input data"),
      @ApiResponse(responseCode = "404", description = "Product with this label not found"),
      @ApiResponse(responseCode = "403",
          description = "Forbidden - User is not authenticated or not authorized"),
      @ApiResponse(responseCode = "401", description = "Manager must be authenticated"),

  })
  @GetMapping("/stats")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public Map<String, Object> getSalesStatistics(
      @RequestParam String productLabel,
      @RequestParam(required = false) Integer month,
      @RequestParam(required = false) Integer year
  ) {
    if (month != null && (month < 1 || month > 12)) {
      throw new BadRequestException("Invalid month value: " + month);
    }

    if (productService.findByLabelIgnoreCase(productLabel) == null) {
      throw new ResourceNotFoundException(
          "Product with label " + productLabel + " does not exist"
      );
    }
    List<ProductLotDto> lots = productLotService.getLotsAndSalesData(productLabel, month, year);

    if (lots == null || lots.isEmpty()) {
      return Map.of(
          "totalReceived", 0,
          "totalSold", 0,
          "salesPerDay", Map.of(),
          "receivedPerDay", Map.of()
      );
    }

    Map<String, Integer> totals = productLotService.aggregateQuantities(lots);

    Map<String, Integer> salesPerDay = productLotService
        .calculateSalesPerDay(productLabel, month, year);

    Map<String, Integer> receivedPerDay = productLotService
        .calculateReceivedLotPerDay(productLabel, month, year);

    Map<String, Integer> openSalesPerDay = 
        openSaleService.calculateOpenSalesPerDay(productLabel, month, year);
    Map<String, Integer> finalSalesPerDay = mergeMaps(salesPerDay, openSalesPerDay);

    return Map.of(
      "totalReceived", totals.get("totalReceived"),
      "totalSold", totals.get("totalSold"),
      "salesPerDay", finalSalesPerDay,
      "receivedPerDay", receivedPerDay
    );
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(
      summary = "Decrease the quantity of a product lot",
      description = "Removes a specified quantity from a product lot already on sale.",
      security = @SecurityRequirement(name = "bearerAuth")
    )
  @ApiResponses({
      @ApiResponse(responseCode = "200", description = "Quantity removed successfully"),
      @ApiResponse(responseCode = "404", description = "Product lot not found"),
      @ApiResponse(responseCode = "400", description = "Quantity to remove must be positive, "
          + "and id must be a valid number"),
      @ApiResponse(responseCode = "403", description = 
        "Forbidden - User is not authenticated or not authorized"),
      @ApiResponse(responseCode = "401", description = "Must be authenticated"),
  })
  @PatchMapping("remove/{id}")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public void decreaseProductLotQuantity(
      @PathVariable("id") Long id,
      @RequestParam int qty
  ) {
    if (qty <= 0) {
      throw new BadRequestException("Quantity to remove must be positive");
    }
    productLotService.decreaseQuantity(id, qty);
  }

}

