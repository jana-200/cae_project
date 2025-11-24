package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Producers types entity.
 */
@Entity
@Table(name = "producers")
@Data
@NoArgsConstructor
public class Producer {

  @Id
  private Long userId;

  @OneToOne
  @MapsId
  @JoinColumn(name = "user_id")
  private User user;

  @Column(nullable = false)
  private String companyName;
}
