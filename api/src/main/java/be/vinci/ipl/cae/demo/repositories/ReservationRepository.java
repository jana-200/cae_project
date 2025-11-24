package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Reservation;
import be.vinci.ipl.cae.demo.models.entities.User;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for managing Reservation entities.
 */
@Repository
public interface ReservationRepository extends CrudRepository<Reservation, Long> {

  /**
   * Retrieves all reservations made by a specific customer.
   *
   * @param customer the user who made the reservations
   * @return a list of reservations associated with the given customer
   */
  List<Reservation> findAllByCustomer(User customer);

  /**
   * Retrieves all reservations stored in the database.
   *
   * @return a list of all Reservation entities
   */
  @Override
  List<Reservation> findAll();

}
