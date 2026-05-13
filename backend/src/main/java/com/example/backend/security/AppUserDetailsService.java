package com.example.backend.security;

import com.example.backend.user.UserRepository;
import java.util.Arrays;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AppUserDetailsService implements UserDetailsService {
  private final UserRepository repo;

  public AppUserDetailsService(UserRepository repo) {
    this.repo = repo;
  }

  @Override
  public UserDetails loadUserByUsername(String username) {
    var u = repo.findByUsername(username)
        .orElseThrow(() -> new UsernameNotFoundException("User not found"));

    var authorities = Arrays.stream(u.getRoles().split(","))
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
        .map(SimpleGrantedAuthority::new)
        .toList();

    return User.withUsername(u.getUsername())
        .password(u.getPasswordHash())
        .authorities(authorities)
        .build();
  }
}

