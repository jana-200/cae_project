package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;


/**
 * Notification entity.
 */
@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "notified_user")
  private User notifiedUser;

  @Column(nullable = false)
  private String notificationTitle;

  @Column(nullable = false)
  private LocalDateTime notificationDate;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status;

  @Column(nullable = false)
  private String message;

  /**
   * Enum representing notification status.
   */
  public enum Status {
    READ,
    UNREAD
  }
}
