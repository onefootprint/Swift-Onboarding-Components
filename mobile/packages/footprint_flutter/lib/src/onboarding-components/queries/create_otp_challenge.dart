import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/models/internal/auth_method.dart';
import 'package:footprint_flutter/src/onboarding-components/models/challenge_response.dart';
import 'package:footprint_flutter/src/onboarding-components/models/identify_response.dart';
import 'package:footprint_flutter/src/onboarding-components/models/inline_otp_not_supported_exception.dart';
import 'package:http/http.dart' as http;

typedef OtpChallengeRequest = ({
  String? email,
  String? phoneNumber,
  String obConfig,
  String? sandboxId
});

Future<IdentifyResponse> identify(OtpChallengeRequest requestData) async {
  final headers = {
    'Content-Type': 'application/json',
    'X-Onboarding-Config-Key': requestData.obConfig,
  };
  if (requestData.sandboxId != null) {
    headers['X-Sandbox-Id'] = requestData.sandboxId!;
  }

  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/identify'),
    headers: headers,
    body: jsonEncode({
      'email': requestData.email,
      'phoneNumber': requestData.phoneNumber,
      "scope": "onboarding",
    }),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return IdentifyResponse.fromJson(responseBody);
  } else {
    throw Exception('Failed to identify before creating OTP challenge');
  }
}

Future<ChallengeResponse> loginChallenge(
    {String kind = "sms", required String token}) async {
  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/identify/login_challenge'),
    headers: {'Content-Type': 'application/json', 'X-Fp-Authorization': token},
    body: jsonEncode({"preferred_challenge_kind": kind}),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return ChallengeResponse.fromJson(responseBody);
  } else {
    throw Exception('Failed to create login challenge');
  }
}

Future<ChallengeResponse> signupChallenge(
    OtpChallengeRequest requestData) async {
  final headers = {
    'Content-Type': 'application/json',
    'X-Onboarding-Config-Key': requestData.obConfig,
  };
  if (requestData.sandboxId != null) {
    headers['X-Sandbox-Id'] = requestData.sandboxId!;
  }

  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/identify/signup_challenge'),
    headers: headers,
    body: jsonEncode({
      'email': {
        "value": requestData.email,
        "is_bootstrapped": false,
      },
      'phone_number': {
        "value": requestData.phoneNumber,
        "is_bootstrapped": false,
      },
      "scope": "onboarding",
    }),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return ChallengeResponse.fromJson(responseBody);
  } else {
    throw Exception('Failed to create OTP signup challenge');
  }
}

Future<ChallengeResponse> createOtpChallenge(
    OtpChallengeRequest requestData) async {
  final identifyResponse = await identify(requestData);
  if (identifyResponse.user?.authMethods != null) {
    final hasVerifiedSource =
        identifyResponse.user!.authMethods!.any((e) => e.isVerified);
    if (!hasVerifiedSource) {
      throw InlineOtpNotSupportedException("No verified source found");
    }
    final hasPhone = identifyResponse.user!.authMethods!.any(
      (e) => e.kind == AuthMethodKind.phone && e.isVerified,
    );
    if (hasPhone) {
      final loginChallengeResponse =
          await loginChallenge(token: identifyResponse.user!.token!);
      return loginChallengeResponse;
    }
  }
  final signupChallengeResponse = await signupChallenge(requestData);
  return signupChallengeResponse;
}
