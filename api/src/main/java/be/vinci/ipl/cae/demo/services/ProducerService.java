package be.vinci.ipl.cae.demo.services;

import be.vinci.ipl.cae.demo.exceptions.BadRequestException;
import be.vinci.ipl.cae.demo.exceptions.ResourceNotFoundException;
import be.vinci.ipl.cae.demo.models.dtos.ProducerDto;
import be.vinci.ipl.cae.demo.models.dtos.ProductLotDto;
import be.vinci.ipl.cae.demo.models.entities.Producer;
import be.vinci.ipl.cae.demo.models.entities.User;
import be.vinci.ipl.cae.demo.models.entities.User.Role;
import be.vinci.ipl.cae.demo.repositories.ProducerRepository;
import be.vinci.ipl.cae.demo.repositories.ProductLotRepository;
import be.vinci.ipl.cae.demo.repositories.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;


/**
 * Producer service.
 */
@Service
public class ProducerService {

  private final ProducerRepository producerRepository;
  private final ProductLotRepository productLotRepository;
  private final UserRepository userRepository;
  private final HelperService helperService;

  /**
   * Constructor.
   */
  public ProducerService(ProducerRepository producerRepository,
      ProductLotRepository productLotRepository, UserRepository userRepository,
      HelperService helperService) {
    this.productLotRepository = productLotRepository;
    this.producerRepository = producerRepository;
    this.userRepository = userRepository;
    this.helperService = helperService;
  }



  /**
   * Find a producer by it id else return null.
   */

  public Producer findById(Long id) {
    return producerRepository.findById(id)
        .orElse(null);
  }

  /**
   * Find all producers.
   *
   * @return a list of all producers
   */
  public List<ProducerDto> findAll() {
    List<Producer> producers = producerRepository.findAll();
    return producers.stream()
        .map(producer -> new ProducerDto(
            producer.getUser().getUserId(),
            producer.getUser().getFirstname(),
            producer.getUser().getLastname(),
            producer.getUser().getEmail(),
            producer.getCompanyName(),
            producer.getUser().isDeactivated(), 
            producer.getUser().getAddress(), 
            producer.getUser().getPhoneNumber()
            ))
        .toList();
  }

  /**
   * Find all lots for a specific producer.
   *
   * @param email the email of the producer
   * @return a list of lots for the specified producer
   */
  public List<ProductLotDto> findLotsByProducer(String email) {
    User user = userRepository.findByEmail(email);
    if (user == null) {
      throw new ResourceNotFoundException("User not found");
    }
    if (user.getRole() != Role.PRODUCER) {
      throw new BadRequestException("Email must be a producer user");
    }
    return productLotRepository.findByProducerUserId(user.getUserId()).stream()
        .filter(lot -> helperService.hasSameEmail(lot, email))
        .map(helperService::toDto)
        .toList();
  }

}
