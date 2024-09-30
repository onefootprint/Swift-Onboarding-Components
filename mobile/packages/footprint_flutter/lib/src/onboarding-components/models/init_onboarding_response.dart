import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';

class InitOnboardingResponse {
  final OnboardingConfig onboardingConfig;
  final String authToken;

  InitOnboardingResponse({
    required this.onboardingConfig,
    required this.authToken,
  });

  factory InitOnboardingResponse.fromJson(Map<String, dynamic> json) {
    return InitOnboardingResponse(
      onboardingConfig: OnboardingConfig.fromJson(json['onboarding_config']),
      authToken: json['auth_token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'onboarding_config': onboardingConfig.toJson(),
      'auth_token': authToken,
    };
  }
}
