package be.vinci.ipl.cae.demo.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * new Notification.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NewNotification {
  private String notifiedUser;
  private String notificationTitle;
  private String message;
}
