package be.vinci.ipl.cae.demo.models.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for changing the password.
 */
@Data
@NoArgsConstructor
public class ChangePassword {

  private String currentPassword;
  private String newPassword;
}
