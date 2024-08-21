import 'package:footprint_flutter/src/onboarding-components/models/challenge_data.dart';

class ChallengeResponse {
  final ChallengeData? challengeData;
  final dynamic error;

  ChallengeResponse({this.challengeData, this.error});

  factory ChallengeResponse.fromJson(Map<String, dynamic> json) {
    return ChallengeResponse(
      challengeData: json['challenge_data'] != null
          ? ChallengeData.fromJson(json['challenge_data'])
          : null,
      error: json['error'],
    );
  }
}
