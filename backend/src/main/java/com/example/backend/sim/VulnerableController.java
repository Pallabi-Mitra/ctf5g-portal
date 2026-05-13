package com.example.backend.sim;

import java.time.Duration;
import java.time.Instant;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/sim")
public class VulnerableController {
  private static final Map<String, Integer> csrfDemoCounter = new ConcurrentHashMap<>();

  private static final Duration RATE_WINDOW = Duration.ofSeconds(10);
  private static final int RATE_MAX = 10;
  private static final Map<String, Deque<Instant>> hitsByKey = new ConcurrentHashMap<>();

  @PostMapping("/vulnerable/csrf-change")
  public Map<String, Object> csrfVulnerableStateChange(
      Authentication auth,
      @RequestParam(defaultValue = "inc") String action
  ) {
    String key = auth == null ? "anonymous" : auth.getName();
    int next = csrfDemoCounter.merge(key, "dec".equalsIgnoreCase(action) ? -1 : 1, Integer::sum);
    return Map.of(
        "user", key,
        "counter", next
    );
  }

  @GetMapping("/protected/rate-limited")
  public ResponseEntity<Map<String, Object>> rateLimited(@RequestParam(defaultValue = "client") String clientKey) {
    Instant now = Instant.now();
    Deque<Instant> q = hitsByKey.computeIfAbsent(clientKey, k -> new ConcurrentLinkedDeque<>());

    prune(q, now);
    if (q.size() >= RATE_MAX) {
      return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS).body(Map.of(
          "ok", false,
          "reason", "rate_limited",
          "windowSeconds", RATE_WINDOW.toSeconds(),
          "maxRequests", RATE_MAX
      ));
    }

    q.addLast(now);
    return ResponseEntity.ok(Map.of(
        "ok", true,
        "remaining", Math.max(0, RATE_MAX - q.size()),
        "windowSeconds", RATE_WINDOW.toSeconds()
    ));
  }

  private static void prune(Deque<Instant> q, Instant now) {
    Instant cutoff = now.minus(RATE_WINDOW);
    while (true) {
      Instant first = q.peekFirst();
      if (first == null || !first.isBefore(cutoff)) {
        return;
      }
      q.pollFirst();
    }
  }
}

