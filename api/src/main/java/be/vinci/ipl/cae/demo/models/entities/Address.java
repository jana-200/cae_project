package be.vinci.ipl.cae.demo.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Address entity.
 */
@Entity
@Table(name = "addresses")
@Data
@NoArgsConstructor
public class Address {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long addressId;

  @Column(nullable = false)
  private String street;

  @Column(nullable = false)
  private String number;

  @Column()
  private String poBox;

  @Column(nullable = false)
  private String postalCode;

  @Column(nullable = false)
  private String country;

  @Column(nullable = false)
  private String city;

}
