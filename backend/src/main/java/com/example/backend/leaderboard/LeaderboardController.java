package com.example.backend.leaderboard;

import com.example.backend.user.User;
import com.example.backend.user.UserRepository;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leaderboard")
public class LeaderboardController {

  private final UserRepository users;

  public LeaderboardController(UserRepository users) {
    this.users = users;
  }

  public record LeaderboardEntry(String username, int score, int solvedCount) {}

  @GetMapping
  public List<LeaderboardEntry> leaderboard() {
    Comparator<User> byScore = Comparator.comparingInt(User::getScore).reversed()
        .thenComparing(User::getUsername);
    return users.findAll().stream()
        .sorted(byScore)
        .map(u -> new LeaderboardEntry(
            u.getUsername(),
            u.getScore(),
            u.getSolvedAttacks().size()
        ))
        .collect(Collectors.toList());
  }
}
