package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Unit;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for managing Unit entities.
 */
@Repository
public interface UnitRepository extends CrudRepository<Unit, Long> {

  /**
   * Find a Unit by its label, ignoring case.
   *
   * @param label the label of the Unit
   * @return the Unit entity with the specified label, or null if not found
   */
  Unit findByLabelIgnoreCase(String label);
}