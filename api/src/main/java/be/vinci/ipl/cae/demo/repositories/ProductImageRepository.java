package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.ProductImage;
import java.util.List;
import org.springframework.data.repository.CrudRepository;

/**
 * ProductImage Repository.
 */
public interface ProductImageRepository extends CrudRepository<ProductImage, Long> {
  /**
   * Find all ProductImage entities associated with a specific product ID.
   *
   * @param productId the ID of the product
   * @return a list of ProductImage entities associated with the product
   */
  List<ProductImage> findByProductProductId(Long productId);

}
