package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.OpenSale;
import be.vinci.ipl.cae.demo.models.entities.ProductOpenSale;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/*
 * ProductOpenSale repository.
 */
@Repository
public interface ProductOpenSaleRepository extends CrudRepository<ProductOpenSale, Long> {

  /**
   * Finds all ProductOpenSale by OpenSale.
   *
   * @param openSale the OpenSale
   * @return a list of ProductOpenSale
   */
  List<ProductOpenSale> findAllByOpenSale(OpenSale openSale);

  /**
   * Finds all ProductOpenSale by OpenSale and product label.
   *
   * @param productLabel the product label
   * @return a list of ProductOpenSale
   */
  @Query("""
   SELECT p FROM ProductOpenSale p
   WHERE LOWER(p.productLot.product.label) = LOWER(:productLabel)
      """)
  List<ProductOpenSale> findAllByProductLabel(@Param("productLabel") String productLabel);


}
