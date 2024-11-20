class InitOnboardingResponse {
  final String authToken;

  InitOnboardingResponse({
    required this.authToken,
  });

  factory InitOnboardingResponse.fromJson(Map<String, dynamic> json) {
    return InitOnboardingResponse(
      authToken: json['auth_token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'auth_token': authToken,
    };
  }
}
