package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Address;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * producer DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProducerDto {
  private Long userId;
  private String firstname;
  private String lastname;
  private String email;
  private String companyName;
  private boolean deactivated;
  private Address address;
  private String phoneNumber; 
}
