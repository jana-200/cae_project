package be.vinci.ipl.cae.demo.repositories;

import be.vinci.ipl.cae.demo.models.entities.Producer;
import java.util.List;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

/**
 * Producer repository.
 * 
 * 
 */
@Repository
public interface ProducerRepository extends CrudRepository<Producer, Long> {

  /**
    * Finds a producer by its user email.
    *
    * @param email the email of the producer
    * @return the producer with the given email, or null if not found
  */
  Producer findByUserEmail(String email);

  /**
   * Finds all producers.
   *
   * @return a list of all producers
   */
  @Override
  List<Producer> findAll();
  
}
