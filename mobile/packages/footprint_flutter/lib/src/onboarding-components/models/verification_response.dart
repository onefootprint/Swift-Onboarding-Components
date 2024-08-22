class VaultingTokenResponse {
  final String token;
  final String expiresAt;

  VaultingTokenResponse({
    required this.token,
    required this.expiresAt,
  });

  factory VaultingTokenResponse.fromJson(Map<String, dynamic> json) {
    return VaultingTokenResponse(
      token: json['token'],
      expiresAt: json['expires_at'],
    );
  }
}

class VarificationResponse {
  final String authToken;

  VarificationResponse({
    required this.authToken,
  });

  factory VarificationResponse.fromJson(Map<String, dynamic> json) {
    return VarificationResponse(
      authToken: json['auth_token'],
    );
  }
}

class ValidationTokenResponse {
  final String validationToken;

  ValidationTokenResponse({
    required this.validationToken,
  });

  factory ValidationTokenResponse.fromJson(Map<String, dynamic> json) {
    return ValidationTokenResponse(
      validationToken: json['validation_token'],
    );
  }
}
