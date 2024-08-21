class ChallengeData {
  final String token;
  final String challengeKind;
  final String challengeToken;
  final String? biometricChallengeJson = null;
  final num timeBeforeRetryS;

  ChallengeData({
    required this.token,
    required this.challengeKind,
    required this.challengeToken,
    required this.timeBeforeRetryS,
  });

  factory ChallengeData.fromJson(Map<String, dynamic> json) {
    return ChallengeData(
      token: json['token'],
      challengeKind: json['challenge_kind'],
      challengeToken: json['challenge_token'],
      timeBeforeRetryS: json['time_before_retry_s'],
    );
  }
}
