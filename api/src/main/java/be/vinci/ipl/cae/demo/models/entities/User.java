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
 * User entity.
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long userId;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String password;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private String firstname;

  @Column(nullable = false)
  private String lastname;

  @Column(nullable = false)
  private String phoneNumber;

  @ManyToOne
  @JoinColumn(name = "address")
  private Address address;

  @Column(nullable = false)
  private LocalDateTime registrationDate;

  @ManyToOne
  @JoinColumn(name = "account_creator_manager")
  private User accountCreatorManager;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role; 

  @Column(nullable = false)
  private boolean deactivated = false;

  /**
   * Role .
   */
  public enum Role {
    CUSTOMER,
    PRODUCER,
    MANAGER
  }

}
