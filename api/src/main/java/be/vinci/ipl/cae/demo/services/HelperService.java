package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.dtos.ProductLotDto;
import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import java.time.LocalDate;
import org.springframework.stereotype.Service;

/**
 * HelperService provides utility methods.
 */
@Service
public class HelperService {

  /**
   * Converts a ProductLot entity to a ProductLotDto.
   *
   * @param lot The ProductLot entity
   * @return The ProductLotDto
   */

  public ProductLotDto toDto(ProductLot lot) {
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
  }

  /**
   * Checks if the email of the producer of the given ProductLot matches the provided email.
   *
   * @param lot The ProductLot entity
   * @param email The email to check
   * @return true if the emails match, false otherwise
   */
  public boolean hasSameEmail(ProductLot lot, String email) {
    return lot.getProducer().getUser().getEmail().equals(email);
  }

  /**
   * Checks if the given date matches the provided month and year.
   *
   * @param date The date to check
   * @param month The month to check (can be null)
   * @param year The year to check (can be null)
   * @return true if the date matches the month and year, false otherwise
   */
  public boolean matchesDate(LocalDate date, Integer month, Integer year) {
    return (month == null || date.getMonthValue() == month)
        && (year == null || date.getYear() == year);
  }
}
