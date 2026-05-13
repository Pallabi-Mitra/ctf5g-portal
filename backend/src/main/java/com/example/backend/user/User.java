package com.example.backend.user;

import jakarta.persistence.Column;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true, length = 50)
  private String username;

  @Column(nullable = false, length = 100)
  private String passwordHash;

  @Column(nullable = false, length = 200)
  private String roles = "USER";

  @Column(nullable = false)
  private int score = 0;

  @ElementCollection(fetch = FetchType.EAGER)
  @CollectionTable(name = "user_solved_attacks", joinColumns = @JoinColumn(name = "user_id"))
  @Column(name = "attack_key", nullable = false, length = 64)
  private Set<String> solvedAttacks = new HashSet<>();

  @Column(nullable = false, updatable = false)
  private Instant createdAt = Instant.now();
}

