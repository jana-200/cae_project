package be.vinci.ipl.cae.demo.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyBoolean;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.NewProductLot;
import be.vinci.ipl.cae.demo.models.dtos.ProductDto;
import be.vinci.ipl.cae.demo.models.dtos.ProductLotDto;
import be.vinci.ipl.cae.demo.models.entities.*;
import be.vinci.ipl.cae.demo.models.entities.ProductLot.State;
import be.vinci.ipl.cae.demo.repositories.ProductImageRepository;
import be.vinci.ipl.cae.demo.repositories.ProductLotRepository;
import be.vinci.ipl.cae.demo.repositories.ProductReservationRepository;
import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobClientBuilder;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class ProductLotServiceTest {

  @Mock
  private ProductLotRepository productLotRepository;

  @Mock
  private ProductService productService;

  @Mock
  private ProducerService producerService;

  @Mock
  private ProductTypeService productTypeService;

  @Mock
  private ProductImageRepository productImageRepository;
  @Mock
  private ProductReservationRepository productReservationRepository;

  @Mock
  private BlobClientBuilder blobClientBuilder;

  @Mock(lenient = true)
  private HelperService helperService;

  @Mock
  private BlobClient blobClient;
  @Spy
  @InjectMocks
  private ProductLotService productLotService;

  private Product product;
  private Producer producer;
  private ProductType productType;
  private ProductLot productLot;
  private ProductLot productLot2;
  private ProductImage productImage;
  private User user;

  @BeforeEach
  void setUp() {
    productType = new ProductType();
    productType.setLabel("Electronics");
    productType.setTypeId(1L);

    user = new User();
    user.setEmail("producer@example.com");
    user.setFirstname("John");
    user.setLastname("Doe");

    producer = new Producer();
    producer.setUserId(1L);
    producer.setUser(user);

    product = new Product();
    product.setProductId(1L);
    product.setLabel("Laptop");
    product.setDescription("High performance laptop");
    product.setType(productType);
    product.setUnit(new Unit());

    productImage = new ProductImage();
    productImage.setImageId(1L);
    productImage.setUrl("http://example.com/image.jpg");
    productImage.setProduct(product);

    productLot = new ProductLot();
    productLot.setLotId(1L);
    productLot.setProduct(product);
    productLot.setProducer(producer);
    productLot.setImage(productImage);
    productLot.setState(ProductLot.State.PENDING);
    productLot.setUnitPrice(999.99);
    productLot.setInitialQuantity(10);
    productLot.setRemainingQuantity(10);
    productLot.setAvailabilityDate(LocalDateTime.now().plusDays(1));

    productLot2 = new ProductLot();
    productLot2.setLotId(1L);
    productLot2.setProduct(product);
    productLot2.setProducer(producer);
    productLot2.setImage(productImage);
    productLot2.setState(State.SOLD_OUT);
    productLot2.setUnitPrice(999.99);
    productLot2.setInitialQuantity(10);
    productLot2.setRemainingQuantity(10);
    productLot2.setAvailabilityDate(LocalDateTime.now().plusDays(1));

    when(helperService.matchesDate(any(LocalDate.class), any(), any())).thenAnswer(invocation -> {
      LocalDate date = invocation.getArgument(0);
      Integer month = invocation.getArgument(1);
      Integer year = invocation.getArgument(2);
      boolean monthMatches = (month == null) || (date.getMonthValue() == month);
      boolean yearMatches = (year == null) || (date.getYear() == year);
      return monthMatches && yearMatches;
    });

  }

  @Test
  void findAllOrderedByState_SortEveryState() {

    when(helperService.toDto(any(ProductLot.class))).thenAnswer(invocation -> {
      ProductLot lot = invocation.getArgument(0);
      return new ProductLotDto(
          lot.getLotId(),
          lot.getProduct().getLabel(),
          lot.getProduct().getType().getLabel(),
          lot.getImage() != null ? lot.getImage().getUrl() : null,
          lot.getProducer().getUser().getEmail(),
          lot.getUnitPrice(),
          lot.getRemainingQuantity(),
          lot.getAvailabilityDate(),
          lot.getProduct().getUnit().getLabel(),
          lot.getProduct().getDescription(),
          lot.getInitialQuantity(),
          lot.getSoldQuantity(),
          lot.getReservedQuantity(),
          lot.getState(),
          lot.getProducer().getUser().getFirstname() + " " + lot.getProducer().getUser().getLastname()
      );
    });
    
    ProductLot acceptedLot = new ProductLot();
    acceptedLot.setState(ProductLot.State.ACCEPTED);
    acceptedLot.setProduct(product);
    acceptedLot.setProducer(producer);
    acceptedLot.setImage(productImage);
    acceptedLot.setUnitPrice(productLot.getUnitPrice());
    acceptedLot.setInitialQuantity(productLot.getInitialQuantity());
    acceptedLot.setRemainingQuantity(productLot.getRemainingQuantity());
    acceptedLot.setAvailabilityDate(productLot.getAvailabilityDate());

    ProductLot forSaleLot = new ProductLot();
    forSaleLot.setState(ProductLot.State.FOR_SALE);
    forSaleLot.setProduct(product);
    forSaleLot.setProducer(producer);
    forSaleLot.setImage(productImage);
    forSaleLot.setUnitPrice(productLot.getUnitPrice());
    forSaleLot.setInitialQuantity(productLot.getInitialQuantity());
    forSaleLot.setRemainingQuantity(productLot.getRemainingQuantity());
    forSaleLot.setAvailabilityDate(productLot.getAvailabilityDate());

    ProductLot rejectedLot = new ProductLot();
    rejectedLot.setState(ProductLot.State.REJECTED);
    rejectedLot.setProduct(product);
    rejectedLot.setProducer(producer);
    rejectedLot.setImage(productImage);
    rejectedLot.setUnitPrice(productLot.getUnitPrice());
    rejectedLot.setInitialQuantity(productLot.getInitialQuantity());
    rejectedLot.setRemainingQuantity(productLot.getRemainingQuantity());
    rejectedLot.setAvailabilityDate(productLot.getAvailabilityDate());

    List<ProductLot> allLots = List.of(
        productLot,
        acceptedLot,
        forSaleLot,
        rejectedLot,
        productLot2
    );

    when(productLotRepository.findAll()).thenReturn(allLots);

    List<ProductLotDto> result = productLotService.findAllOrderedByState();

    assertAll("verify product lot list sorted by state",
        () -> assertNotNull(result),
        () -> assertEquals(5, result.size()),
        () -> assertEquals(State.PENDING, result.get(0).getProductLotState()),
        () -> assertEquals(State.ACCEPTED, result.get(1).getProductLotState()),
        () -> assertEquals(State.FOR_SALE, result.get(2).getProductLotState()),
        () -> assertEquals(State.REJECTED, result.get(3).getProductLotState()),
        () -> assertEquals(State.SOLD_OUT, result.get(4).getProductLotState())
    );

    verify(productLotRepository).findAll();
  }


  @Test
  void addShouldCreateNewProductWhenNotExists() {
    // Arrange
    when(blobClientBuilder.endpoint(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.sasToken(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.containerName(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.blobName(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.buildClient()).thenReturn(blobClient);
    when(productTypeService.findByLabel("Electronics")).thenReturn(productType);
    when(productService.findByLabelIgnoreCase("Laptop")).thenReturn(null);
    ProductDto productDto = new ProductDto();
    productDto.setLabel("Laptop");
    productDto.setDescription("High performance laptop");
    productDto.setUnit("kg");
    productDto.setType("Electronics");
    
    when(productService.createProduct(productDto)).thenReturn(product);
    when(producerService.findById(1L)).thenReturn(producer);

    when(productImageRepository.save(any())).thenReturn(productImage);

    MultipartFile image = mock(MultipartFile.class);

    // Act
    NewProductLot lot= new NewProductLot();
    lot.setProductLabel("Laptop");
    lot.setProductDescription("High performance laptop");
    lot.setUnit("kg");
    lot.setProductType("Electronics");
    lot.setProducer(1L);
    lot.setUnitPrice(999.99);
    lot.setInitialQuantity(10);
    lot.setAvailabilityDate(LocalDateTime.now().plusDays(1));

    NewProductLot result = productLotService.add(lot, image);

    // Assert
    assertNotNull(result);
    verify(productLotService).uploadImageToBlob(any(MultipartFile.class));
    verify(blobClient).upload(any(), anyLong(), eq(true));
    verify(blobClient).setMetadata(any());
    verify(blobClient).setHttpHeaders(any());

  }

  @Test
  void addShouldNotCreateNewProductWhenExists() {
    // Arrange
    when(blobClientBuilder.endpoint(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.sasToken(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.containerName(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.blobName(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.buildClient()).thenReturn(blobClient);
    when(productTypeService.findByLabel("Electronics")).thenReturn(productType);

    when(productService.findByLabelIgnoreCase("Laptop")).thenReturn(product);

    when(producerService.findById(1L)).thenReturn(producer);
    when(productImageRepository.save(any())).thenReturn(productImage);

    MultipartFile image = mock(MultipartFile.class);

    NewProductLot lot= new NewProductLot();
    lot.setProductLabel("Laptop");
    lot.setProductDescription("High performance laptop");
    lot.setUnit("kg");
    lot.setProductType("Electronics");
    lot.setProducer(1L);
    lot.setUnitPrice(999.99);
    lot.setInitialQuantity(10);
    lot.setAvailabilityDate(LocalDateTime.now().plusDays(1));
    // Act
    NewProductLot result = productLotService.add(lot, image);

    // Assert
    assertNotNull(result);
    verify(productService, never()).createProduct(any());
    verify(productLotRepository).save(any(ProductLot.class));
    verify(productImageRepository).save(any(ProductImage.class));
    verify(blobClient).upload(any(), anyLong(), eq(true));
    verify(blobClient).setMetadata(any());
    verify(blobClient).setHttpHeaders(any());
  }




  @Test
  void findLotsForProducer() {
    when(helperService.toDto(any(ProductLot.class))).thenAnswer(invocation -> {
      ProductLot lot = invocation.getArgument(0);
      return new ProductLotDto(
          lot.getLotId(),
          lot.getProduct().getLabel(),
          lot.getProduct().getType().getLabel(),
          lot.getImage() != null ? lot.getImage().getUrl() : null,
          lot.getProducer().getUser().getEmail(),
          lot.getUnitPrice(),
          lot.getRemainingQuantity(),
          lot.getAvailabilityDate(),
          lot.getProduct().getUnit().getLabel(),
          lot.getProduct().getDescription(),
          lot.getInitialQuantity(),
          lot.getSoldQuantity(),
          lot.getReservedQuantity(),
          lot.getState(),
          lot.getProducer().getUser().getFirstname() + " " + lot.getProducer().getUser().getLastname()
      );
    });

    when(productLotRepository.findByState(ProductLot.State.PENDING))
        .thenReturn(List.of(productLot));
    when(helperService.hasSameEmail(any(ProductLot.class), eq("producer@example.com"))).thenReturn(true);

    List<ProductLotDto> result = productLotService.findLotsForProducer(
        "producer@example.com", ProductLot.State.PENDING);


    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(1, result.size())
    );
    assertEquals("Laptop", result.get(0).getProductLabel());
  }

  @Test
  void findProductLotByState() {
    when(productLotRepository.findByState(ProductLot.State.PENDING))
        .thenReturn(List.of(productLot));

    List<ProductLotDto> result = productLotService.findProductLotByState(
        ProductLot.State.PENDING);

    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(1, result.size())
    );
  }

  @Test
  void findRecentLotsForSale() {
    when(productLotRepository.findTop5ByStateOrderByReceiptDateDesc(
        ProductLot.State.FOR_SALE))
        .thenReturn(List.of(productLot));

    List<ProductLotDto> result = productLotService.findRecentLotsForSale();

    assertAll(
        () -> assertNotNull(result),
        () -> assertEquals(1, result.size())
    );
  }

  @Test
  void getProductLotByIdWhenNotExists_shouldThrowResourceNotFoundException() {
    when(productLotRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () ->
        productLotService.getProductLotById(1L)
    );
  }


  @Test
  void updateProductLotImageSuccessfully() {
    // Arrange
    when(blobClientBuilder.endpoint(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.sasToken(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.containerName(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.blobName(any())).thenReturn(blobClientBuilder);
    when(blobClientBuilder.buildClient()).thenReturn(blobClient);
    when(productLotRepository.findById(1L)).thenReturn(Optional.of(productLot));

    when(productImageRepository.save(any())).thenReturn(productImage);

    // Act
    boolean result = productLotService.updateProductLotImage(1L, mock(MultipartFile.class));

    // Assert
    assertTrue(result);
    verify(blobClient).upload(any(), anyLong(), eq(true));
    verify(blobClient).setMetadata(any());
    verify(blobClient).setHttpHeaders(any());

  }

  @Test
  void updateProductLotImageWhenLotNotFound() {
    when(productLotRepository.findById(1L)).thenReturn(Optional.empty());

    boolean result = productLotService.updateProductLotImage(1L, mock(MultipartFile.class));

    assertFalse(result);
  }

  @Test
  void addShouldThrowExceptionWhenProductTypeIsNotFound() {
    when(productTypeService.findByLabel("Invalid")).thenReturn(null);
    MultipartFile image = mock(MultipartFile.class);

    NewProductLot lot= new NewProductLot();
    lot.setProductLabel("InvalidProduct");
    lot.setProductDescription("desc");
    lot.setUnit("kg");
    lot.setProductType("Invalid");
    lot.setProducer(1L);
    lot.setUnitPrice(10.0);
    lot.setInitialQuantity(5);
    lot.setAvailabilityDate(LocalDateTime.now());

    assertThrows(BadRequestException.class, () ->
        productLotService.add(lot, image)
    );
  }
  @Test
  void addShouldThrowExceptionWhenProductIsNullAndUnitOrDescMissing() {
    when(productTypeService.findByLabel("Electronics")).thenReturn(productType);
    when(productService.findByLabelIgnoreCase("Laptop")).thenReturn(null);

    NewProductLot lot= new NewProductLot();
    lot.setProductLabel("Laptop");
    lot.setProductDescription(null);
    lot.setUnit(null);
    lot.setProductType("Electronics");
    lot.setProducer(1L);
    lot.setUnitPrice(10.0);
    lot.setInitialQuantity(5);
    lot.setAvailabilityDate(LocalDateTime.now());
    
     assertThrows(BadRequestException.class, () ->
        productLotService.add(lot, mock(MultipartFile.class))
    );
  }

  @Test
  void addShouldThrowExceptionWhenUnitOrDescMissing() {
    when(productTypeService.findByLabel("Electronics")).thenReturn(productType);
    when(productService.findByLabelIgnoreCase("Laptop")).thenReturn(null);

    NewProductLot lot= new NewProductLot();
    lot.setProductLabel("Laptop");
    lot.setProductDescription(null);
    lot.setUnit(null);
    lot.setProductType("Electronics");
    lot.setProducer(1L);
    lot.setUnitPrice(10.0);
    lot.setInitialQuantity(5);
    lot.setAvailabilityDate(LocalDateTime.now());

     assertThrows(BadRequestException.class, () ->
        productLotService.add(lot, mock(MultipartFile.class))
    );
  }

  @Test
  void addShouldThrowExceptionWhenProducerIsNull() {
    
    when(productTypeService.findByLabel("Electronics")).thenReturn(productType);
    when(productService.findByLabelIgnoreCase("Laptop")).thenReturn(product);
    when(producerService.findById(1L)).thenReturn(null);

    MultipartFile image = mock(MultipartFile.class);

    NewProductLot lot= new NewProductLot();
    lot.setProductLabel("Laptop");
    lot.setProductDescription("High performance laptop");
    lot.setUnit("kg");
    lot.setProductType("Electronics");
    lot.setProducer(1L);
    lot.setUnitPrice(999.99);
    lot.setInitialQuantity(105);
    lot.setAvailabilityDate(LocalDateTime.now().plusDays(1));

    assertThrows(ResourceNotFoundException.class, () ->
      productLotService.add(lot, image)
    );
    verify(blobClient, never()).upload(any(), anyLong(), anyBoolean());
    verify(productImageRepository, never()).save(any());
    verify(productLotRepository, never()).save(any());
  }

  @Test
  void updateLotStateShouldUpdateWhenLotExists() {
    when(productLotRepository.findById(1L)).thenReturn(Optional.of(productLot));

    boolean result = productLotService.updateLotState(1L, State.ACCEPTED);

    assertAll(() ->
            assertTrue(result),
        () -> assertEquals(State.ACCEPTED, productLot.getState()));
    verify(productLotRepository).save(productLot);
  }

  @Test
  void updateLotStateShouldReturnFalseWhenLotNotFound() {
    when(productLotRepository.findById(1L)).thenReturn(Optional.empty());

    boolean result = productLotService.updateLotState(1L, State.ACCEPTED);

    assertFalse(result);
    verify(productLotRepository, never()).save(any());
  }

  @Test
  void getLotsAndSalesDataShouldReturnAllLotsWhenNoDateProvided() {
    when(helperService.toDto(any(ProductLot.class))).thenAnswer(invocation -> {
      ProductLot lot = invocation.getArgument(0);
      return new ProductLotDto(
          lot.getLotId(),
          lot.getProduct().getLabel(),
          lot.getProduct().getType().getLabel(),
          lot.getImage() != null ? lot.getImage().getUrl() : null,
          lot.getProducer().getUser().getEmail(),
          lot.getUnitPrice(),
          lot.getRemainingQuantity(),
          lot.getAvailabilityDate(),
          lot.getProduct().getUnit().getLabel(),
          lot.getProduct().getDescription(),
          lot.getInitialQuantity(),
          lot.getSoldQuantity(),
          lot.getReservedQuantity(),
          lot.getState(),
          lot.getProducer().getUser().getFirstname() + " " + lot.getProducer().getUser().getLastname()
      );
    });
    when(productLotRepository.findByProductLabelIgnoreCase("Laptop")).thenReturn(
        List.of(productLot));

    List<ProductLotDto> result = productLotService.getLotsAndSalesData("Laptop", null, null);
    assertAll(() ->
            assertEquals(1, result.size()),
        () -> assertEquals("Laptop", result.get(0).getProductLabel())
    );
  }

  @Test
  void getLotsAndSalesDataShouldFilterByRetrievedReservations() {
    when(helperService.toDto(any(ProductLot.class))).thenAnswer(invocation -> {
      ProductLot lot = invocation.getArgument(0);
      return new ProductLotDto(
          lot.getLotId(),
          lot.getProduct().getLabel(),
          lot.getProduct().getType().getLabel(),
          lot.getImage() != null ? lot.getImage().getUrl() : null,
          lot.getProducer().getUser().getEmail(),
          lot.getUnitPrice(),
          lot.getRemainingQuantity(),
          lot.getAvailabilityDate(),
          lot.getProduct().getUnit().getLabel(),
          lot.getProduct().getDescription(),
          lot.getInitialQuantity(),
          lot.getSoldQuantity(),
          lot.getReservedQuantity(),
          lot.getState(),
          lot.getProducer().getUser().getFirstname() + " " + lot.getProducer().getUser().getLastname()
      );
    });
    ProductReservation reservation = new ProductReservation();
    Reservation res = new Reservation();
    res.setState(Reservation.State.RETRIEVED);
    res.setRecoveryDate(LocalDate.of(2024, 4, 10));
    reservation.setReservation(res);
    reservation.setProductLot(productLot);

    when(productLotRepository.findByProductLabelIgnoreCase("Laptop")).thenReturn(
        List.of(productLot));
    when(productReservationRepository.findByProductLotIn(List.of(productLot)))
        .thenReturn(List.of(reservation));

    List<ProductLotDto> result = productLotService.getLotsAndSalesData("Laptop", 4, 2024);

    assertAll(() ->
            assertEquals(1, result.size()),
        () -> assertEquals("Laptop", result.get(0).getProductLabel())
    );

  }

  @Test
  void getLotsAndSalesDataShouldIncludeLotsByReceiptDate() {
    productLot.setReceiptDate(LocalDateTime.of(2024, 4, 10, 0, 0));
    when(productLotRepository.findByProductLabelIgnoreCase("Laptop")).thenReturn(
        List.of(productLot));
    when(productReservationRepository.findByProductLotIn(List.of(productLot))).thenReturn(
        List.of());

    List<ProductLotDto> result = productLotService.getLotsAndSalesData("Laptop", 4, 2024);

    assertEquals(1, result.size());
  }

  @Test
  void calculateSalesPerDayShouldReturnEmptyMapWhenNoLots() {
    when(productLotRepository.findByProductLabelIgnoreCase("Unknown")).thenReturn(List.of());

    Map<String, Integer> result = productLotService.calculateSalesPerDay("Unknown", null, null);

    assertTrue(result.isEmpty());
  }

  @Test
  void calculateSalesPerDayShouldReturnQuantitiesGroupedByDate() {
    ProductReservation res1 = new ProductReservation();
    Reservation r1 = new Reservation();
    r1.setState(Reservation.State.RETRIEVED);
    r1.setRecoveryDate(LocalDate.of(2025, 4, 19));
    res1.setReservation(r1);
    res1.setQuantity(5);

    ProductReservation res2 = new ProductReservation();
    Reservation r2 = new Reservation();
    r2.setState(Reservation.State.RETRIEVED);
    r2.setRecoveryDate(LocalDate.of(2025, 4, 19));
    res2.setReservation(r2);
    res2.setQuantity(3);

    when(productLotRepository.findByProductLabelIgnoreCase("Laptop")).thenReturn(
        List.of(productLot));
    when(productReservationRepository.findByProductLotIn(List.of(productLot)))
        .thenReturn(List.of(res1, res2));

    Map<String, Integer> result = productLotService.calculateSalesPerDay("Laptop", 4, 2025);
    assertAll(() ->
            assertEquals(1, result.size()),
        () -> assertEquals(8, result.get("2025-04-19")));
  }

  @Test
  void aggregateQuantitiesShouldReturnZerosForEmptyList() {
    Map<String, Integer> result = productLotService.aggregateQuantities(List.of());
    assertAll(() ->
            assertEquals(0, result.get("totalReceived")),
        () -> assertEquals(0, result.get("totalSold")));
  }

  @Test
  void aggregateQuantitiesShouldReturnCorrectSums() {
    State state = State.FOR_SALE;
    ProductLotDto lot1 = new ProductLotDto(
        1L,
        "Laptop",
        "Electronics",
        "http://example.com/image.jpg",
        "producer@example.com",
        999.99,
        5,
        LocalDateTime.now(),
        "kg",
        "High performance laptop",
        10,
        4,
        1,
        state,
        "John Doe"
    );
    ProductLotDto lot2 = new ProductLotDto(
        2L,
        "Laptop",
        "Electronics",
        "http://example.com/image2.jpg",
        "producer@example.com",
        899.99,
        3,
        LocalDateTime.now().plusDays(1),
        "kg",
        "Budget laptop",
        5,
        2,
        1,
        state,
        "John Doe"
    );

    Map<String, Integer> result = productLotService.aggregateQuantities(List.of(lot1, lot2));
    assertAll(() ->
            assertEquals(15, result.get("totalReceived")),
        () -> assertEquals(6, result.get("totalSold")));
  }

  @Test
  void addShouldPropagateRuntimeExceptionWhenImageUploadFails() {

    MultipartFile image = mock(MultipartFile.class);

    doThrow(new RuntimeException("upload failed"))
        .when(productLotService).uploadImageToBlob(any(MultipartFile.class));

    when(productTypeService.findByLabel("Electronics")).thenReturn(productType);
    when(productService.findByLabelIgnoreCase("Laptop")).thenReturn(product);
    when(producerService.findById(1L)).thenReturn(producer);

    NewProductLot lot= new NewProductLot();
    lot.setProductLabel("Laptop");
    lot.setProductDescription("High performance laptop");
    lot.setUnit("kg");
    lot.setProductType("Electronics");
    lot.setProducer(1L);
    lot.setUnitPrice(999.99);
    lot.setInitialQuantity(105);
    lot.setAvailabilityDate(LocalDateTime.now().plusDays(1));


    RuntimeException ex = assertThrows(RuntimeException.class, () ->
        productLotService.add(lot,image)
    );

    assertEquals("upload failed", ex.getMessage());

    verify(productImageRepository, never()).save(any());
    verify(productLotRepository, never()).save(any());
  }

  @Test
  void getLotsAndSalesDataShouldFilterByMonthOnly() {
    when(helperService.toDto(any(ProductLot.class))).thenAnswer(invocation -> {
      ProductLot lot = invocation.getArgument(0);
      return new ProductLotDto(
          lot.getLotId(),
          lot.getProduct().getLabel(),
          lot.getProduct().getType().getLabel(),
          lot.getImage() != null ? lot.getImage().getUrl() : null,
          lot.getProducer().getUser().getEmail(),
          lot.getUnitPrice(),
          lot.getRemainingQuantity(),
          lot.getAvailabilityDate(),
          lot.getProduct().getUnit().getLabel(),
          lot.getProduct().getDescription(),
          lot.getInitialQuantity(),
          lot.getSoldQuantity(),
          lot.getReservedQuantity(),
          lot.getState(),
          lot.getProducer().getUser().getFirstname() + " " + lot.getProducer().getUser().getLastname()
      );
    });
    ProductReservation resApril = new ProductReservation();
    Reservation rApril = new Reservation();
    rApril.setState(Reservation.State.RETRIEVED);
    rApril.setRecoveryDate(LocalDate.of(2025, 4, 15));
    resApril.setReservation(rApril);
    resApril.setProductLot(productLot);

    when(productLotRepository.findByProductLabelIgnoreCase("Laptop"))
        .thenReturn(List.of(productLot));
    when(productReservationRepository.findByProductLotIn(List.of(productLot)))
        .thenReturn(List.of(resApril));

    List<ProductLotDto> result = productLotService.getLotsAndSalesData("Laptop", 4, null);

    assertAll(
        () -> assertEquals(1, result.size()),
        () -> assertEquals("Laptop", result.get(0).getProductLabel())
    );
  }

  @Test
  void getLotsAndSalesDataShouldFilterByYearOnly() {
    when(helperService.toDto(any(ProductLot.class))).thenAnswer(invocation -> {
      ProductLot lot = invocation.getArgument(0);
      return new ProductLotDto(
          lot.getLotId(),
          lot.getProduct().getLabel(),
          lot.getProduct().getType().getLabel(),
          lot.getImage() != null ? lot.getImage().getUrl() : null,
          lot.getProducer().getUser().getEmail(),
          lot.getUnitPrice(),
          lot.getRemainingQuantity(),
          lot.getAvailabilityDate(),
          lot.getProduct().getUnit().getLabel(),
          lot.getProduct().getDescription(),
          lot.getInitialQuantity(),
          lot.getSoldQuantity(),
          lot.getReservedQuantity(),
          lot.getState(),
          lot.getProducer().getUser().getFirstname() + " " + lot.getProducer().getUser().getLastname()
      );
    });
    ProductLot lot2023 = new ProductLot();
    lot2023.setProduct(product);
    lot2023.setProducer(producer);
    lot2023.setImage(productImage);
    lot2023.setState(State.PENDING);
    lot2023.setReceiptDate(LocalDateTime.of(2023, 8, 20, 0, 0));

    when(productLotRepository.findByProductLabelIgnoreCase("Laptop"))
        .thenReturn(List.of(lot2023));
    when(productReservationRepository.findByProductLotIn(List.of(lot2023)))
        .thenReturn(List.of());

    List<ProductLotDto> result = productLotService.getLotsAndSalesData("Laptop", null, 2023);

    assertAll(
        () -> assertEquals(1, result.size()),
        () -> assertEquals("Laptop", result.get(0).getProductLabel())
    );
  }

  @Test
  void calculateSalesPerDayShouldReturnTotalsWhenNoFilter() {
    ProductReservation res1 = new ProductReservation();
    Reservation r1 = new Reservation();
    r1.setState(Reservation.State.RETRIEVED);
    r1.setRecoveryDate(LocalDate.of(2025, 4, 19));
    res1.setReservation(r1);
    res1.setQuantity(5);

    ProductReservation res2 = new ProductReservation();
    Reservation r2 = new Reservation();
    r2.setState(Reservation.State.RETRIEVED);
    r2.setRecoveryDate(LocalDate.of(2025, 4, 20));
    res2.setReservation(r2);
    res2.setQuantity(3);

    when(productLotRepository.findByProductLabelIgnoreCase("Laptop"))
        .thenReturn(List.of(productLot));
    when(productReservationRepository.findByProductLotIn(List.of(productLot)))
        .thenReturn(List.of(res1, res2));

    Map<String, Integer> result =
        productLotService.calculateSalesPerDay("Laptop", null, null);

    assertAll(
        () -> assertEquals(2, result.size()),
        () -> assertEquals(5, result.get("2025-04-19")),
        () -> assertEquals(3, result.get("2025-04-20")),

        () -> assertEquals(
            List.of("2025-04-19", "2025-04-20"),
            new ArrayList<>(result.keySet())
        )
    );

  }

  @Test
  void calculateSalesPerDayShouldFilterByMonthOnly() {

    ProductReservation resMay = new ProductReservation();
    Reservation rMay = new Reservation();
    rMay.setState(Reservation.State.RETRIEVED);
    rMay.setRecoveryDate(LocalDate.of(2025, 5, 1));
    resMay.setReservation(rMay);
    resMay.setQuantity(7);

    when(productLotRepository.findByProductLabelIgnoreCase("Laptop"))
        .thenReturn(List.of(productLot));
    when(productReservationRepository.findByProductLotIn(List.of(productLot)))
        .thenReturn(List.of(resMay));

    Map<String, Integer> result =
        productLotService.calculateSalesPerDay("Laptop", 5, null);

    assertEquals(1, result.size());
    assertTrue(result.containsKey("2025-05-01"));
    assertEquals(7, result.get("2025-05-01"));
  }

  @Test
  void calculateSalesPerDayShouldFilterByYearOnly() {

    ProductReservation resDec = new ProductReservation();
    Reservation rDec = new Reservation();
    rDec.setState(Reservation.State.RETRIEVED);
    rDec.setRecoveryDate(LocalDate.of(2024, 12, 31));
    resDec.setReservation(rDec);
    resDec.setQuantity(2);

    when(productLotRepository.findByProductLabelIgnoreCase("Laptop"))
        .thenReturn(List.of(productLot));
    when(productReservationRepository.findByProductLotIn(List.of(productLot)))
        .thenReturn(List.of(resDec));

    Map<String, Integer> result =
        productLotService.calculateSalesPerDay("Laptop", null, 2024);

    assertEquals(1, result.size());
    assertTrue(result.containsKey("2024-12-31"));
    assertEquals(2, result.get("2024-12-31"));
  }

  @Test
  void calculateSalesPerDayShouldIgnoreNonRetrievedReservations() {

    ProductReservation resCanceled = new ProductReservation();
    Reservation rCanceled = new Reservation();
    rCanceled.setState(Reservation.State.CANCELED);
    rCanceled.setRecoveryDate(LocalDate.of(2025, 4, 10));
    resCanceled.setReservation(rCanceled);
    resCanceled.setProductLot(productLot);
    resCanceled.setQuantity(99);

    when(productLotRepository.findByProductLabelIgnoreCase("Laptop"))
        .thenReturn(List.of(productLot));
    when(productReservationRepository.findByProductLotIn(List.of(productLot)))
        .thenReturn(List.of(resCanceled));

    Map<String, Integer> result =
        productLotService.calculateSalesPerDay("Laptop", null, null);

    assertTrue(result.isEmpty(), "Les réservations non‑RETRIEVED doivent être ignorées");
  }

  @Test
  void updateLotState_shouldSetReceiptDate_whenNewStateIsForSale() {
    when(productLotRepository.findById(1L)).thenReturn(Optional.of(productLot));

    boolean result = productLotService.updateLotState(1L, ProductLot.State.FOR_SALE);

    assertTrue(result);
    assertNotNull(productLot.getReceiptDate());
    verify(productLotRepository).save(productLot);
  }

  @Test  
  void decreaseQuantityShouldWorkCorrectly() {
    productLot.setRemainingQuantity(10);
    productLot.setRemovedQuantity(0);

    when(productLotRepository.findById(1L)).thenReturn(Optional.of(productLot));

    productLotService.decreaseQuantity(1L, 5);

    assertAll(
        () -> assertEquals(5, productLot.getRemainingQuantity()),
        () -> assertEquals(5, productLot.getRemovedQuantity()),
        () -> assertEquals(ProductLot.State.PENDING, productLot.getState())
    );

    verify(productLotRepository).save(productLot);
  }

  @Test
  void decreaseQuantityShouldSetSoldOutWhenRemainingQuantityZero() {
    productLot.setRemainingQuantity(5);
    productLot.setRemovedQuantity(0);

    when(productLotRepository.findById(1L)).thenReturn(Optional.of(productLot));

    productLotService.decreaseQuantity(1L, 5);

    assertAll(
        () -> assertEquals(0, productLot.getRemainingQuantity()),
        () -> assertEquals(5, productLot.getRemovedQuantity()),
        () -> assertEquals(ProductLot.State.SOLD_OUT, productLot.getState())
    );

    verify(productLotRepository).save(productLot);
  }

  @Test
  void decreaseQuantityShouldThrowIfProductLotNotFound() {
    when(productLotRepository.findById(1L)).thenReturn(Optional.empty());

    assertThrows(ResourceNotFoundException.class, () -> {
      productLotService.decreaseQuantity(1L, 5);
    });

    verify(productLotRepository, never()).save(any());
  }

  @Test
  void decreaseQuantityShouldThrowIfQuantityToRemoveIsZeroOrNegative() {


    assertThrows(BadRequestException.class, () -> {
      productLotService.decreaseQuantity(1L, 0);
    });

    assertThrows(BadRequestException.class, () -> {
      productLotService.decreaseQuantity(1L, -5);
    });

    verify(productLotRepository, never()).save(any());
  }

  @Test
  void decreaseQuantityShouldThrowIfNotEnoughQuantity() {
    productLot.setRemainingQuantity(3);

    when(productLotRepository.findById(1L)).thenReturn(Optional.of(productLot));

    assertThrows(ConflictException.class, () -> {
      productLotService.decreaseQuantity(1L, 5); 
    });

    verify(productLotRepository, never()).save(any());
  }

  @Test
  void updateLotState_shouldUpdateStateAndReceiptDateWhenForSale() {
    ProductLot lot = new ProductLot();
    when(productLotRepository.findById(1L)).thenReturn(Optional.of(lot));

    boolean result = productLotService.updateLotState(1L, ProductLot.State.FOR_SALE);

    assertTrue(result);
    assertEquals(ProductLot.State.FOR_SALE, lot.getState());
    assertNotNull(lot.getReceiptDate());
    verify(productLotRepository).save(lot);
  }

  @Test
  void updateLotState_shouldReturnFalseIfNotFound() {
    when(productLotRepository.findById(1L)).thenReturn(Optional.empty());

    boolean result = productLotService.updateLotState(1L, ProductLot.State.ACCEPTED);

    assertFalse(result);
  }

  @Test
  void add_shouldThrowBadRequestWhenProductTypeNotFound() {
    NewProductLot newLot = mock(NewProductLot.class);
    when(newLot.getProductType()).thenReturn("Unknown");
    when(productTypeService.findByLabel("Unknown")).thenReturn(null);

    assertThrows(BadRequestException.class, () -> {
        productLotService.add(newLot, mock(MultipartFile.class));
    });
  }

  @Test
  void add_shouldThrowBadRequestWhenProductIsNullAndMissingFields() {
    NewProductLot newLot = mock(NewProductLot.class);
    when(newLot.getProductType()).thenReturn("Fruit");
    when(productTypeService.findByLabel("Fruit")).thenReturn(new ProductType());
    when(newLot.getProductLabel()).thenReturn("NewProduct");
    when(productService.findByLabelIgnoreCase("NewProduct")).thenReturn(null);
    when(newLot.getProductDescription()).thenReturn(null);

    assertThrows(BadRequestException.class, () -> {
        productLotService.add(newLot, mock(MultipartFile.class));
    });
  }
}