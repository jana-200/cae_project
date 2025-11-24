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
 * Units entity.
 */
@Entity
@Table(name = "units")
@Data
@NoArgsConstructor
public class Unit {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long unitId;

  @Column(nullable = false, unique = true)
  private String label;
}
