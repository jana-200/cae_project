package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewProductLot;
import be.vinci.ipl.cae.demo.models.dtos.ProductDto;
import be.vinci.ipl.cae.demo.models.dtos.ProductLotDto;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.Product;
import be.vinci.ipl.cae.demo.models.entities.ProductImage;
import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import be.vinci.ipl.cae.demo.models.entities.ProductLot.State;
import be.vinci.ipl.cae.demo.models.entities.ProductReservation;
import be.vinci.ipl.cae.demo.models.entities.ProductType;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.repositories.ProductImageRepository;
import be.vinci.ipl.cae.demo.repositories.ProductLotRepository;
import be.vinci.ipl.cae.demo.repositories.ProductReservationRepository;
import com.azure.storage.blob.BlobClientBuilder;
import com.azure.storage.blob.models.BlobHttpHeaders;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * ProductLot service.
 */
@Service
public class ProductLotService {

  private final ProductLotRepository productLotRepository;
  private final ProductService productService;
  private final ProducerService producerService;
  private final ProductTypeService productTypeService;
  private final ProductImageRepository productImageRepository;
  private final ProductReservationRepository productReservationRepository;

  private final String blobServiceEndpoint;
  private final String sasToken;
  private final String containerName;
  private final BlobClientBuilder baseBlobClientBuilder;
  private final HelperService helperService;

  /**
   * Constructor.
   */
  public ProductLotService(ProductLotRepository productLotRepository, ProductService productService,
      ProducerService producerService, ProductTypeService productTypeService,
      ProductImageRepository productImageRepository,
      ProductReservationRepository productReservationRepository,
      @Value("${azure.blob.service-endpoint}") String blobServiceEndpoint,
      @Value("${azure.blob.sas-token}") String sasToken,
      @Value("${azure.blob.container-name}") String containerName,
      BlobClientBuilder baseBlobClientBuilder, HelperService helperService) {
    this.productLotRepository = productLotRepository;
    this.productService = productService;
    this.producerService = producerService;
    this.productTypeService = productTypeService;
    this.productImageRepository = productImageRepository;
    this.productReservationRepository = productReservationRepository;
    this.blobServiceEndpoint = blobServiceEndpoint;
    this.sasToken = sasToken;
    this.containerName = containerName;
    this.baseBlobClientBuilder = baseBlobClientBuilder;
    this.helperService = helperService;
  }


  /**
   * Retrieves all product lots that match the given state. This method transforms the ProductLot
   * entities into DTOs (ProductLotResponse) to be returned to the frontend.
   **/
  public List<ProductLotDto> findAllOrderedByState() {
    List<ProductLot> allLots = (List<ProductLot>) productLotRepository.findAll();
    return allLots.stream()
        .sorted((l1, l2) -> getStateOrder(l1.getState()) - getStateOrder(l2.getState()))
        .map(helperService::toDto)
        .toList();
  }

  /**
   * Adds a new product lot. If the product with the given label does not exist, it will be created
   * using the provided description, unit and product type.
   *
   * @param newLot data of the new product lot to add
   * @param image  the image of the product lot
   * @return a NewProductLot DTO containing the data of the created product lot
   */
  @Transactional
  public NewProductLot add(NewProductLot newLot, MultipartFile image) {

    ProductType type = productTypeService.findByLabel(newLot.getProductType());
    if (type == null) {
      throw new BadRequestException("Not existing product type label");
    }

    Product product = productService.findByLabelIgnoreCase(newLot.getProductLabel());
    if (product == null) {
      if (newLot.getProductDescription() == null || newLot.getUnit() == null) {
        throw new BadRequestException("Missing input for the products");
      }
      ProductDto productDto = new ProductDto();
      productDto.setLabel(newLot.getProductLabel());
      productDto.setDescription(newLot.getProductDescription());
      productDto.setUnit(newLot.getUnit());
      productDto.setType(type.getLabel());
      product = productService.createProduct(productDto);
    }

    Producer producer = producerService.findById(newLot.getProducer());
    if (producer == null) {
      throw new ResourceNotFoundException("Producer not found");
    }

    String blobUrl = uploadImageToBlob(image);
    ProductImage productImage = new ProductImage();
    productImage.setProduct(product);
    productImage.setUrl(blobUrl);
    productImage = productImageRepository.save(productImage);

    ProductLot lot = new ProductLot();
    lot.setProduct(product);
    lot.setProducer(producer);
    lot.setImage(productImage);
    lot.setUnitPrice(newLot.getUnitPrice());
    lot.setInitialQuantity(newLot.getInitialQuantity());
    lot.setSoldQuantity(0);
    lot.setRemainingQuantity(newLot.getInitialQuantity());
    lot.setReservedQuantity(0);
    lot.setRemovedQuantity(0);
    lot.setResponsibleManager(null);
    lot.setProposalDate(LocalDateTime.now());
    lot.setAvailabilityDate(newLot.getAvailabilityDate());
    lot.setReceiptDate(null);
    lot.setState(ProductLot.State.PENDING);

    productLotRepository.save(lot);

    return newLot;
  }

  /**
   * Upload an image to a blob on Azure storage with a generated UUID as filename. The image is
   * uploaded to the "images" folder. The original filename is stored in the metadata.
   *
   * @return the blob url
   */
  String uploadImageToBlob(MultipartFile image) {
    String imageUuid = UUID.randomUUID().toString();
    Map<String, String> metadata = new HashMap<>();

    String blobName = imageUuid;

    metadata.put("originalFileName", image.getOriginalFilename());
    BlobClientBuilder blobClientBuilder = baseBlobClientBuilder
        .endpoint(blobServiceEndpoint)
        .sasToken(sasToken)
        .containerName(containerName)
        .blobName(blobName);

    try {
      blobClientBuilder.buildClient().upload(image.getInputStream(), image.getSize(), true);
      blobClientBuilder.buildClient().setMetadata(metadata);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    blobClientBuilder.buildClient()
        .setHttpHeaders(new BlobHttpHeaders().setContentType(image.getContentType()));

    return blobClientBuilder.buildClient().getBlobUrl();
  }

  /**
   * Helper method to get the order of the state.
   *
   * @param state The state to order
   * @return The order of the state
   */
  private int getStateOrder(ProductLot.State state) {

    return switch (state) {
      case PENDING -> 0;
      case ACCEPTED -> 1;
      case FOR_SALE -> 2;
      case REJECTED -> 3;
      case SOLD_OUT -> 4;
    };
  }

  /**
   * Retrieves all product lots for a specific producer and state.
   *
   * @param email The email of the producer
   * @param state The state to filter by
   * @return List of ProductLotDto
   */
  public List<ProductLotDto> findLotsForProducer(String email, ProductLot.State state) {
    return productLotRepository.findByState(state).stream()
        .filter(lot -> helperService.hasSameEmail(lot, email))
        .map(helperService::toDto)
        .toList();
  }

  /**
   * Retrieves all product lots matching a given state.
   *
   * @param state The state to filter by
   * @return List of ProductLotDto
   */
  public List<ProductLotDto> findProductLotByState(ProductLot.State state) {

    return productLotRepository.findByState(state).stream()
        .map(helperService::toDto)
        .toList();
  }

  /**
   * Retrieves the most recent product lots that are currently marked as "for sale".
   *
   * @return a list of the most recent product lots with state FOR_SALE
   */
  public List<ProductLotDto> findRecentLotsForSale() {
    return productLotRepository.findTop5ByStateOrderByReceiptDateDesc(
            ProductLot.State.FOR_SALE).stream()
        .map(helperService::toDto)
        .toList();
  }


  /**
   * Retrieves a ProductLot by its ID and returns a ProductLotDto.
   *
   * @param id The ID of the ProductLot to retrieve.
   * @return A ProductLotDto representing the product lot
   * @throws ResourceNotFoundException if the lot is not found.
   */
  public ProductLotDto getProductLotById(Long id) {

    ProductLot productLot = productLotRepository.findById(id).orElse(null);

    if (productLot == null) {
      throw new ResourceNotFoundException("Product lot with ID " + id + " not found");
    }

    return helperService.toDto(productLot);
  }

  /**
   * Updates the image of the product lot with the given ID.
   *
   * @param id    The ID of the product lot to update.
   * @param image The new image to associate with the product lot.
   * @return true if the image was updated successfully, false otherwise.
   */
  @Transactional
  public boolean updateProductLotImage(Long id, MultipartFile image) {

    ProductLot productLot = productLotRepository.findById(id).orElse(null);

    if (productLot == null) {
      return false;
    }

    String blobUrl = uploadImageToBlob(image);

    ProductImage productImage = new ProductImage();
    productImage.setProduct(productLot.getProduct());
    productImage.setUrl(blobUrl);
    productImage = productImageRepository.save(productImage);

    productLot.setImage(productImage);
    productLotRepository.save(productLot);

    return true;
  }

  /**
   * Updates the state of a product lot identified by its ID.
   *
   * @param id       the ID of the lot to update
   * @param newState the new state to assign to the lot
   * @return true if the lot was found and successfully updated, false if no lot with the given ID
   *        was found
   */
  @Transactional
  public boolean updateLotState(Long id, ProductLot.State newState) {
    ProductLot lot = productLotRepository.findById(id).orElse(null);
    if (lot == null) {
      return false;
    }
    lot.setState(newState);
    if (newState == ProductLot.State.FOR_SALE) {
      lot.setReceiptDate(LocalDateTime.now());
    }
    productLotRepository.save(lot);
    return true;
  }


  /**
   * Filters a list of product reservations based on their state and recovery date. Only
   * reservations with a state of "RETRIEVED" and matching the specified month and year (if
   * provided) are included in the result.
   *
   * @param reservations the list of product reservations to filter
   * @param month        the month to filter by (1-12), or null to ignore the month
   * @param year         the year to filter by, or null to ignore the year
   * @return a list of product reservations that match the specified state and date criteria
   */
  private List<ProductReservation> filterReservationsByStateAndDate(
      List<ProductReservation> reservations, Integer month, Integer year) {
    return reservations.stream()
        .filter(r -> r.getReservation().getState() == Reservation.State.RETRIEVED)
        .filter(r -> helperService.matchesDate(r.getReservation().getRecoveryDate(), month, year))
        .toList();
  }

  /**
   * Returns product lots for a given product label, optionally filtered by month and year based on
   * retrieved reservations. If no date is provided, all lots for the product are returned.
   * Otherwise, only lots linked to RETRIEVED reservations in that period are included.
   *
   * @param productLabel the product label
   * @param month        optional month filter
   * @param year         optional year filter
   * @return a list of matching product lot DTOs, or empty list if none found
   */
  public List<ProductLotDto> getLotsAndSalesData(String productLabel, Integer month, Integer year) {
    List<ProductLot> allLots = productLotRepository.findByProductLabelIgnoreCase(productLabel);

    if (allLots.isEmpty()) {
      return List.of();
    }

    if (month == null && year == null) {
      return allLots.stream()
          .map(helperService::toDto)
          .toList();
    }

    List<ProductReservation> reservations = productReservationRepository.findByProductLotIn(
        allLots);
    List<ProductReservation> filteredReservations = filterReservationsByStateAndDate(reservations,
        month, year);

    List<ProductLot> retrievedLots = filteredReservations.stream()
        .map(ProductReservation::getProductLot)
        .distinct()
        .toList();

    List<ProductLot> receivedLots = allLots.stream()
        .filter(lot -> lot.getReceiptDate() != null && lot.getState() != State.REJECTED)
        .filter(lot -> helperService.matchesDate(lot.getReceiptDate().toLocalDate(), month, year))
        .toList();

    Set<ProductLot> combinedLots = new HashSet<>();
    combinedLots.addAll(retrievedLots);
    combinedLots.addAll(receivedLots);

    return combinedLots.stream().map(helperService::toDto).toList();
  }


  /**
   * Calculates the total quantity sold per day for a given product label, optionally filtered by
   * month and year. Only reservations with a state of RETRIEVED are considered.
   *
   * @param productLabel the label of the product
   * @param month        the month to filter reservations (nullable)
   * @param year         the year to filter reservations (nullable)
   * @return a map of dates (as String) to total quantity sold on that day, sorted by date
   */
  public Map<String, Integer> calculateSalesPerDay(
      String productLabel,
      Integer month,
      Integer year) {
    List<ProductLot> lots =
        productLotRepository.findByProductLabelIgnoreCase(productLabel);

    if (lots.isEmpty()) {
      return Map.of();
    }

    List<ProductReservation> reservations = productReservationRepository.findByProductLotIn(lots);
    List<ProductReservation> filteredReservations = filterReservationsByStateAndDate(reservations,
        month, year);

    return filteredReservations.stream()
        .collect(Collectors.toMap(
            r -> r.getReservation().getRecoveryDate().toString(),
            ProductReservation::getQuantity,
            Integer::sum,
            TreeMap::new
        ));
  }


  /**
   * Calculates the daily received lot quantities for a specific product, optionally filtered by
   * month and year.
   *
   * @param productLabel the product's label
   * @param month        the month (1-12) to filter by, or null for all months
   * @param year         the year to filter by, or null for all years
   * @return a map of daily received quantities, sorted by date
   */
  public Map<String, Integer> calculateReceivedLotPerDay(
      String productLabel,
      Integer month,
      Integer year) {
    List<ProductLot> lots =
        productLotRepository.findByProductLabelIgnoreCase(productLabel);

    if (lots.isEmpty()) {
      return Map.of();
    }

    return lots.stream()
        .filter(r -> r.getReceiptDate() != null && r.getState() != State.REJECTED)
        .filter(lot -> helperService.matchesDate(lot.getReceiptDate().toLocalDate(), month, year))
        .collect(Collectors.toMap(
            r -> r.getReceiptDate().toString(),
            ProductLot::getInitialQuantity,
            Integer::sum,
            TreeMap::new
        ));
  }


  /**
   * Aggregates the total initial quantity received and total quantity sold from a list of product
   * lot DTOs.
   *
   * @param lots the list of product lot DTOs
   * @return a map containing "totalReceived" and "totalSold" values
   */
  public Map<String, Integer> aggregateQuantities(List<ProductLotDto> lots) {
    int totalInitial = lots.stream().mapToInt(ProductLotDto::getInitialQuantity).sum();
    int totalSold = lots.stream().mapToInt(ProductLotDto::getSoldQuantity).sum();

    return Map.of(
        "totalReceived", totalInitial,
        "totalSold", totalSold
    );
  }

  /**
   * Decreases the remaining quantity of a product lot by a specified amount.
   *
   * @param productLotId     the ID of the product lot
   * @param quantityToRemove the quantity to remove
   * @throws ResourceNotFoundException if the product lot is not found
   * @throws BadRequestException       if the quantity to remove is invalid
   */
  @Transactional
  public void decreaseQuantity(Long productLotId, int quantityToRemove) {
    if (quantityToRemove <= 0) {
      throw new BadRequestException("Quantity to remove must be positive");
    }
    ProductLot lot = productLotRepository.findById(productLotId)
        .orElseThrow(() -> new ResourceNotFoundException("Product lot not found"));

    if (lot.getRemainingQuantity() < quantityToRemove) {
      throw new ConflictException("Not enough quantity to remove");
    }

    lot.setRemainingQuantity(lot.getRemainingQuantity() - quantityToRemove);
    lot.setRemovedQuantity(lot.getRemovedQuantity() + quantityToRemove);

    if (lot.getRemainingQuantity() == 0) {
      lot.setState(ProductLot.State.SOLD_OUT);
    }
    productLotRepository.save(lot);
  }

}
