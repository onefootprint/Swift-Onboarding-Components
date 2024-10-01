import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/models/identify_scope.dart';
import 'package:footprint_flutter/src/onboarding-components/models/init_onboarding_response.dart';
import 'package:footprint_flutter/src/onboarding-components/models/sandbox_outcome.dart';
import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/onboarding-components/models/verification_response.dart';
import 'package:footprint_flutter/src/onboarding-components/queries/validate_onboarding.dart';
import 'package:http/http.dart' as http;

typedef VerifyOtpChallengeRequest = ({
  String verificationCode,
  String challengeToken,
  String token,
  OverallOutcome? overallOutcome,
  OnboardingConfigKind? onboardingConfigKind,
  IdentifyScope? scope,
});

typedef VerifyOtpChallengeResponse = ({
  String authToken,
  String? vaultingToken,
  String validationToken
});

Future<VerificationResponse> verify(
    VerifyOtpChallengeRequest requestData) async {
  final scope = requestData.scope ?? IdentifyScope.onboarding;
  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/identify/verify'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': requestData.token,
      'x-fp-client-version': clientVersion
    },
    body: jsonEncode({
      'challenge_response': requestData.verificationCode,
      'challenge_token': requestData.challengeToken,
      'scope': scope.toString(),
    }),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return VerificationResponse.fromJson(responseBody);
  } else {
    throw Exception('Failed to verify OTP challenge');
  }
}

Future<ValidationTokenResponse> getValidationToken(String token) async {
  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/identify/validation_token'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': token,
      'x-fp-client-version': clientVersion,
    },
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return ValidationTokenResponse.fromJson(responseBody);
  } else {
    throw Exception('Failed to get validation token');
  }
}

Future<InitOnboardingResponse> initOnboarding(
    String token, OverallOutcome? overallOutcome) async {
  final fixtureResult = overallOutcome == null ? null : "$overallOutcome";
  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/onboarding'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': token,
      'x-fp-client-version': clientVersion
    },
    body: jsonEncode({
      'fixture_result': fixtureResult,
    }),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return InitOnboardingResponse.fromJson(responseBody);
  } else {
    throw Exception('Failed to initialize onboarding');
  }
}

Future<VaultingTokenResponse> createVaultingToken(String authToken) async {
  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/user/tokens'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': authToken,
      'x-fp-client-version': clientVersion
    },
    body: jsonEncode({
      "requested_scope": "onboarding_components",
    }),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return VaultingTokenResponse.fromJson(responseBody);
  } else {
    throw Exception('Failed to create vaulting token');
  }
}

Future<VerifyOtpChallengeResponse> verifyOtpChallenge(
    VerifyOtpChallengeRequest requestData) async {
  final response = await verify(requestData);
  final authToken = response.authToken;
  late String vTok;
  String? vaultingToken;
  String updatedAuthToken = authToken;
  if (requestData.onboardingConfigKind == OnboardingConfigKind.auth) {
    vTok = (await validateOnboarding(authToken)).validationToken;
  } else {
    vTok = (await getValidationToken(authToken)).validationToken;
    updatedAuthToken =
        (await initOnboarding(authToken, requestData.overallOutcome))
            .authToken; // treat this updated auth token as the new auth token
    vaultingToken = (await createVaultingToken(updatedAuthToken)).token;
  }
  return (
    authToken: updatedAuthToken,
    vaultingToken: vaultingToken,
    validationToken: vTok,
  );
}
