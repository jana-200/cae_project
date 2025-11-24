package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProductLot;
import jakarta.persistence.LockModeType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * ProductLot repository.
 */
@Repository
public interface ProductLotRepository extends CrudRepository<ProductLot, Long> {
  /**
   * Finds all product lots with a specific state.
   *
   * @param state the state of the product lot (e.g., FOR_SALE)
   * @return a list of product lots matching the given state
   */
  List<ProductLot> findByState(ProductLot.State state);

  /**
   * Finds the top 5 product lots with a specific state, 
   * ordered by availability date in descending order.
   *
   * @param state the state of the product lot (e.g., FOR_SALE)
   * @return a list of the top 5 product lots matching the given state, ordered by receipt date
   */
  List<ProductLot> findTop5ByStateOrderByReceiptDateDesc(ProductLot.State state);

  /**
   * Finds all product lots with a product label matching the given label,
   * ignoring case differences.
   *
   * @param label the label of the product to search for
   * @return a list of product lots whose product label matches the given label, case-insensitively
   */
  List<ProductLot> findByProductLabelIgnoreCase(String label);

  /**
   * Finds all product lots with a specific producer ID.
   *
   * @param producerId the ID of the producer
   * @return a list of product lots associated with the given producer ID
   */
  List<ProductLot> findByProducerUserId(Long producerId);

  /**
   * Retrieves a ProductLot by its ID using a pessimistic write lock.
   *
   * @param id the ID of the product lot to retrieve and lock
   * @return an Optional containing the found  ProductLot, or empty if not found
   */
  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("SELECT p FROM ProductLot p WHERE p.lotId = :id")
  Optional<ProductLot> findByIdForUpdate(@Param("id") Long id);
}

