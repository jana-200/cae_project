package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.models.entities.Unit;
import be.vinci.ipl.cae.demo.repositories.UnitRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for managing units.
 */
@Service
public class UnitService {

  private final UnitRepository unitRepository;

  /**
   * Constructor for UnitService.
   *
   * @param unitRepository the repository to manage unit entities
   */
  public UnitService(UnitRepository unitRepository) {
    this.unitRepository = unitRepository;
  }

  /**
   * Find a unit by its label, ignoring case.
   *
   * @param label the label of the unit
   * @return the Unit entity with the specified label, or null if not found
   */
  public Unit findByLabel(String label) {
    return unitRepository.findByLabelIgnoreCase(label);
  }

  /**
   * Create a new unit with the specified label.
   *
   * @param label the label of the new unit
   * @return the created Unit entity
   */
  @Transactional
  public Unit create(String label) {
    if (label == null) {
      return null;
    }
    if (label.isBlank()) {
      return null;
    }

    Unit unit = new Unit();
    unit.setLabel(label);
    return unitRepository.save(unit);
  }
}