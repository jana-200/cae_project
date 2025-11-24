package be.vinci.ipl.cae.demo.models.dtos;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Notification DTO.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDto {   
  private Long id;
  private String notifiedUser;
  private String notificationTitle;
  private String message;
  private LocalDateTime notificationDate;
  private String status; 
}
