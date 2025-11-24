package be.vinci.ipl.cae.demo.controllers;

import be.vinci.ipl.cae.demo.models.dtos.ProducerDto;
import be.vinci.ipl.cae.demo.models.dtos.ProductLotDto;
import be.vinci.ipl.cae.demo.services.ProducerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller to manage producers.
 */
@RestController
@RequestMapping("/producers")
@CrossOrigin(origins = "http://localhost:5173")
public class ProducerController {

  private final ProducerService producerService;

  /**
  * Constructs a ProducerController with the given ProducerService.
  *
  * @param producerService the service to manage producers
  */
  public ProducerController(ProducerService producerService) {
    this.producerService = producerService;
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @Operation(summary = "Retrieves all producers.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Producers retrieved successfully"),
    @ApiResponse(responseCode = "403", description = "Not authorized must be a manger"),
    @ApiResponse(responseCode = "401", description = "Manager must be authenticated"),
  })
  @GetMapping("/")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  public List<ProducerDto> getProducersList() {
    return producerService.findAll();
    
  }

  /**
   * Swagger java doc. {@Swagger Doc}
   */
  @GetMapping("/lots")
  @PreAuthorize("hasRole('ROLE_MANAGER')")
  @Operation(summary = "Retrieves all lots for a specific producer.",
      security = @SecurityRequirement(name = "bearerAuth"))
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "Lots retrieved successfully"),
    @ApiResponse(responseCode = "404", description = "Producer not found"),
    @ApiResponse(responseCode = "403", description = "Not authorized must be a manger"),
    @ApiResponse(responseCode = "401", description = "Manager must be authenticated"),
    @ApiResponse(responseCode = "400", description = "Email must be of a producer")
  })
  public List<ProductLotDto> getLotsByProducer(@RequestParam String email) {

    return producerService.findLotsByProducer(email);
  }

}
