package com.example.backend.attack;

import com.example.backend.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/attacks")
public class AttackSubmissionController {
  private final UserRepository users;

  public AttackSubmissionController(UserRepository users) {
    this.users = users;
  }

  public record SubmitAttackRequest(
      @NotBlank String attackKey,
      @NotBlank String flag
  ) {}

  @PostMapping("/submit")
  @ResponseStatus(HttpStatus.OK)
  public Map<String, Object> submit(@Valid @RequestBody SubmitAttackRequest req, Authentication auth) {
    String expected = expectedFlag(req.attackKey());
    if (!expected.equals(req.flag().trim())) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Incorrect flag");
    }

    var u = users.findByUsername(auth.getName()).orElseThrow();
    if (u.getSolvedAttacks().contains(req.attackKey())) {
      return Map.of(
          "ok", true,
          "alreadySolved", true,
          "score", u.getScore()
      );
    }

    u.getSolvedAttacks().add(req.attackKey());
    u.setScore(u.getScore() + 100);
    users.save(u);

    return Map.of(
        "ok", true,
        "alreadySolved", false,
        "score", u.getScore()
    );
  }

  private static String expectedFlag(String attackKey) {
    return switch (attackKey) {
      case "dom-xss"             -> "FLAG{DOM_XSS_SUCCESS}";
      case "csrf"                -> "FLAG{CSRF_SUCCESS}";
      case "tcp-syn-flood"       -> "FLAG{SYN_FLOOD_SUCCESS}";
      case "packet-sniffing"     -> "FLAG{PACKET_SNIFF_SUCCESS}";
      case "timing-side-channel" -> "FLAG{TIMING_ATTACK_SUCCESS}";
      case "meet-in-the-middle"  -> "FLAG{MITM_CRYPTO_SUCCESS}";
      case "rop"                 -> "FLAG{ROP_CHAIN_SUCCESS}";
      case "apt-config"          -> "FLAG{APT_CONFIG_SUCCESS}";
      default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unknown attack");
    };
  }
}

