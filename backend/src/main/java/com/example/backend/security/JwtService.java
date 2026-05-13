package com.example.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import javax.crypto.SecretKey;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtService {
  private final JwtProperties props;
  private final SecretKey key;

  public JwtService(JwtProperties props) {
    this.props = props;
    this.key = buildKey(props.secret());
  }

  public String generateToken(UserDetails user) {
    Instant now = Instant.now();
    Instant exp = now.plusSeconds(props.expirationMinutes() * 60);

    List<String> roles = user.getAuthorities().stream()
        .map(GrantedAuthority::getAuthority)
        .toList();

    return Jwts.builder()
        .issuer(props.issuer())
        .subject(user.getUsername())
        .issuedAt(Date.from(now))
        .expiration(Date.from(exp))
        .claim("roles", roles)
        .signWith(key)
        .compact();
  }

  public Claims parseClaims(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }

  private static SecretKey buildKey(String secret) {
    byte[] raw;
    try {
      raw = Decoders.BASE64.decode(secret);
    } catch (Exception ignored) {
      raw = secret.getBytes(StandardCharsets.UTF_8);
    }
    return Keys.hmacShaKeyFor(raw);
  }
}

