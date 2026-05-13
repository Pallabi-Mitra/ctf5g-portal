package com.example.backend.auth;

import com.example.backend.security.JwtService;
import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
  private final UserRepository users;
  private final PasswordEncoder encoder;
  private final AuthenticationManager authManager;
  private final UserDetailsService userDetails;
  private final JwtService jwt;

  public AuthController(
      UserRepository users,
      PasswordEncoder encoder,
      AuthenticationManager authManager,
      UserDetailsService userDetails,
      JwtService jwt
  ) {
    this.users = users;
    this.encoder = encoder;
    this.authManager = authManager;
    this.userDetails = userDetails;
    this.jwt = jwt;
  }

  public record AuthRequest(
      @NotBlank @Size(min = 3, max = 50) String username,
      @NotBlank @Size(min = 6, max = 72) String password
  ) {}

  public record AuthResponse(String token) {}

  @PostMapping("/signup")
  @ResponseStatus(HttpStatus.CREATED)
  public AuthResponse signup(@Valid @RequestBody AuthRequest req) {
    if (users.existsByUsername(req.username())) {
      throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
    }
    var u = new User();
    u.setUsername(req.username());
    u.setPasswordHash(encoder.encode(req.password()));
    u.setRoles("USER");
    users.save(u);

    UserDetails ud = userDetails.loadUserByUsername(req.username());
    return new AuthResponse(jwt.generateToken(ud));
  }

  @PostMapping("/login")
  public AuthResponse login(@Valid @RequestBody AuthRequest req) {
    try {
      authManager.authenticate(new UsernamePasswordAuthenticationToken(req.username(), req.password()));
    } catch (Exception ex) {
      throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
    }
    UserDetails ud = userDetails.loadUserByUsername(req.username());
    return new AuthResponse(jwt.generateToken(ud));
  }
}

