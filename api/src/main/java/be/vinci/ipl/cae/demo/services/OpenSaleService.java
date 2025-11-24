package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.ConflictException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.OpenSaleDto;
import be.vinci.ipl.cae.demo.models.dtos.OpenSaleInfo;
import be.vinci.ipl.cae.demo.models.dtos.OpenSaleProductDto;
import be.vinci.ipl.cae.demo.models.entities.OpenSale;
import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import be.vinci.ipl.cae.demo.models.entities.ProductOpenSale;
import be.vinci.ipl.cae.demo.models.entities.ProductOpenSaleId;
import be.vinci.ipl.cae.demo.repositories.OpenSaleRepository;
import be.vinci.ipl.cae.demo.repositories.ProductLotRepository;
import be.vinci.ipl.cae.demo.repositories.ProductOpenSaleRepository;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * Producer service.
 */
@Service
public class OpenSaleService {

  private final OpenSaleRepository openSaleRepository;
  private final ProductLotRepository productLotRepository;
  private final ProductOpenSaleRepository productOpenSaleRepository;
  private final HelperService helperService;

  /**
   * Constructor.
   */
  public OpenSaleService(OpenSaleRepository openSaleRepository,
      ProductLotRepository productLotRepository, 
      ProductOpenSaleRepository productOpenSaleRepository, 
      HelperService helperService) {
    this.openSaleRepository = openSaleRepository;
    this.productLotRepository = productLotRepository;
    this.productOpenSaleRepository = productOpenSaleRepository;
    this.helperService = helperService;
  }




  private OpenSaleInfo toOpenSaleInfo(OpenSale openSale) {
    List<ProductOpenSale> prs = productOpenSaleRepository.findAllByOpenSale(openSale);
    double total = prs.stream()
        .mapToDouble(pr -> pr.getProductLot().getUnitPrice() * pr.getQuantity())
        .sum();

    return new OpenSaleInfo(
      openSale.getOpenSaleId(),
      (int) total,
      openSale.getOpenSaleDate().toString()
      );
  }

  /**
   * Creates an open sale for a product lot.
   *
   * @param openSaleDto the details of the open sale.
   * @return true if the open sale is created successfully.
   * @throws ResourceNotFoundException if the product lot is not found.
   * @throws ConflictException if the product lot is not for sale or has insufficient quantity.
   */
  @Transactional
  public boolean createOpenSale(OpenSaleDto openSaleDto) {
    OpenSale openSale = new OpenSale();
    openSale.setOpenSaleDate(LocalDateTime.now());

    List<ProductOpenSale> productOpenSales = new ArrayList<>();
    for (OpenSaleProductDto openSaleProductDto : openSaleDto.getReservedProducts()) {
      ProductLot productLot = 
          productLotRepository.findByIdForUpdate(openSaleProductDto.getProductLotId())
          .orElseThrow(() ->
            new ResourceNotFoundException("Product lot not found for ID: " 
                + openSaleProductDto.getProductLotId()));

      if (productLot.getState() != ProductLot.State.FOR_SALE) {
        throw new ConflictException("The product lot is not available for sale.");
      }
      if (productLot.getRemainingQuantity() < openSaleProductDto.getQuantity()) {
        throw new ConflictException("Insufficient quantity for product lot ID: " 
          + productLot.getLotId());
      }

      productLot.setRemainingQuantity(productLot.getRemainingQuantity() 
          - openSaleProductDto.getQuantity());
      productLot.setSoldQuantity(productLot.getSoldQuantity() 
          + openSaleProductDto.getQuantity());

      if (productLot.getRemainingQuantity() == 0) {
        productLot.setState(ProductLot.State.SOLD_OUT);
      }
      productLotRepository.save(productLot);

      openSaleRepository.save(openSale);

      ProductOpenSale productOpenSale = new ProductOpenSale();
      productOpenSale.setId(new ProductOpenSaleId(productLot.getLotId(), 
          openSale.getOpenSaleId()));
      productOpenSale.setProductLot(productLot);
      productOpenSale.setOpenSale(openSale);
      productOpenSale.setQuantity(openSaleProductDto.getQuantity());

      productOpenSales.add(productOpenSale);
    }
    productOpenSaleRepository.saveAll(productOpenSales);
    return true;
  }

  /**
   * Retrieves all open sales.
   *
   * @return a list of all open sales.
   */
  public List<OpenSaleInfo> getAllOpenSales() {
    List<OpenSale> openSales = (List<OpenSale>) openSaleRepository.findAll();
    return openSales.stream().map(this::toOpenSaleInfo).toList();
  }


  /**
   * Retrieves all open sales for a specific product label.
   *
   * @param productLabel the product label to filter by.
   * @param month the month to filter by (optional).
   * @param year the year to filter by (optional).
   * @return a list of open sales for the specified product label.
   */
  public int calculateOpenSalesTotalSold(String productLabel, Integer month, Integer year) {
    List<ProductOpenSale> sales = productOpenSaleRepository.findAllByProductLabel(productLabel);
    return sales.stream()
        .filter(sale -> helperService.matchesDate(sale.getOpenSale()
            .getOpenSaleDate().toLocalDate(), month, year))
        .mapToInt(ProductOpenSale::getQuantity)
        .sum();
  }

  /**
   * Retrieves the total quantity of open sales for a specific product label per day.
   *
   * @param label the product label to filter by.
   * @param month the month to filter by (optional).
   * @param year the year to filter by (optional).
   * @return a map of dates and their corresponding total quantities.
   */
  public Map<String, Integer> calculateOpenSalesPerDay(String label, Integer month, Integer year) {
    List<ProductOpenSale> sales = productOpenSaleRepository.findAllByProductLabel(label);
    return sales.stream()
        .filter(sale -> helperService.matchesDate(sale.getOpenSale()
            .getOpenSaleDate().toLocalDate(), month, year))
        .collect(Collectors.toMap(
            sale -> sale.getOpenSale().getOpenSaleDate().toLocalDate().toString(),
            ProductOpenSale::getQuantity,
            Integer::sum,
            TreeMap::new
        ));
  }
}
