package be.vinci.ipl.cae.demo.models.dtos;

import be.vinci.ipl.cae.demo.models.entities.Address;
import be.vinci.ipl.cae.demo.models.entities.User;
import lombok.Data;
import lombok.NoArgsConstructor;



/**
 *  NewUser DTO.
 */
@Data
@NoArgsConstructor
public class NewUser {

  private String email;
  private String password;
  private String title;
  private String firstname;
  private String lastname;
  private String phoneNumber;
  private Address address;
  private User.Role role;
  private String accountCreatorManager;
  private String companyName;
}
