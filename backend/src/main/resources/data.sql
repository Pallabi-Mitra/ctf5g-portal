insert into challenges (title, description, category, flag) values
('CTF5G-1: NAS Message Parsing', 'Analyze a simplified 5G NAS registration message and identify the field that can be manipulated to bypass a naive validation step.', '5G Protocol', 'CTF5G{nas_parsing_basics}'),
('CTF5G-2: Web Token Leakage', 'Find the endpoint that leaks an access token via an unsafe response pattern, then use it to call a protected API.', 'Web', 'CTF5G{never_log_tokens}'),
('CTF5G-3: SYN Flood Mitigation', 'Interact with the simulated rate-limited endpoint and observe how throttling changes behavior under burst traffic.', 'Network', 'CTF5G{rate_limits_help_not_fix}');

