package com.example.backend.me;

import com.example.backend.user.UserRepository;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class MeController {
  private final UserRepository users;

  public MeController(UserRepository users) {
    this.users = users;
  }

  @GetMapping("/me")
  public Map<String, Object> me(Authentication auth) {
    var u = users.findByUsername(auth.getName()).orElseThrow();
    return Map.of(
        "username", auth.getName(),
        "authorities", auth.getAuthorities(),
        "score", u.getScore(),
        "solvedAttacks", u.getSolvedAttacks()
    );
  }
}

