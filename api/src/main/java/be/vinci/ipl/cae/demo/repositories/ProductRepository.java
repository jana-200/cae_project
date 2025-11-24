package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Product;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * ProductLot repository.
 */
@Repository
public interface ProductRepository extends CrudRepository<Product, Long> {

  /**
   * Find a product by it label.
   *
   * @return the Product
   */
  Product findByLabelIgnoreCase(String productLabel);
  /**
   * Find products by the given prefix of the label.
   *
   * @return a list of product whom the label start with the given prefix
   */

  List<Product> findByLabelStartingWithIgnoreCase(String prefix);
}
