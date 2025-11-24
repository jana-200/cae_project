package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.OpenSale;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Open Sale repository.
 */
@Repository
public interface OpenSaleRepository extends CrudRepository<OpenSale, Long> {

}