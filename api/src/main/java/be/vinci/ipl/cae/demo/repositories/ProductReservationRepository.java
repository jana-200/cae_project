package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import be.vinci.ipl.cae.demo.models.entities.ProductReservation;
import be.vinci.ipl.cae.demo.models.entities.Reservation;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for managing ProductReservation entities.
 */
@Repository
public interface ProductReservationRepository extends CrudRepository<ProductReservation, Long> {
  /**
   * Retrieves all product reservations associated with a given reservation.
   *
   * @param reservation the reservation entity
   * @return a list of ProductReservation entities linked to the reservation
   */
  List<ProductReservation> findAllByReservation(Reservation reservation);

  /**
   * Finds all product reservations associated with any of the given product lots.
   *
   * @param lots the list of product lots to match reservations against
   * @return a list of product reservations linked to the specified product lots
   */
  List<ProductReservation> findByProductLotIn(List<ProductLot> lots);
}
