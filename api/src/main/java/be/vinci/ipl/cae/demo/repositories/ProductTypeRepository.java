package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProductType;
import java.util.List;
import lombok.NonNull;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * ProductLot repository.
 */
@Repository
public interface ProductTypeRepository extends CrudRepository<ProductType, Long> {

  /**
   * Finds a product type by its label (case-sensitive).
   *
   * @param productTypeLabel the label of the product type
   * @return the matching product type, or null if not found
   */
  ProductType findProductTypeByLabel(String productTypeLabel);

  /**
   * Retrieves all product types from the database.
   *
   * @return a non-null list of all ProductType entities
   */
  @Override
  @NonNull
  List<ProductType> findAll();

  /**
   * Finds a product type by its label, ignoring case sensitivity.
   *
   * @param label the label of the product type to search for
   * @return the  ProductType entity if found, or null otherwise
   */
  ProductType findProductTypeByLabelIgnoreCase(String label);
}
