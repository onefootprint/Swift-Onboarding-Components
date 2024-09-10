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
  String? sandboxId,
  List<AuthMethodKind>? requiredAuthMethods,
  String? authToken,
});

typedef OtpIdentifyRequest = ({
  String? email,
  String? phoneNumber,
  String obConfig,
  String? sandboxId,
  String? authToken,
});

Future<IdentifyResponse> identify(OtpIdentifyRequest requestData) async {
  final headers = {
    'Content-Type': 'application/json',
    'X-Onboarding-Config-Key': requestData.obConfig,
  };
  if (requestData.sandboxId != null) {
    headers['X-Sandbox-Id'] = requestData.sandboxId!;
  }
  if (requestData.authToken != null) {
    headers['X-Fp-Authorization'] = requestData.authToken!;
  }

  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/identify'),
    headers: headers,
    body: jsonEncode({
      'email': requestData.email,
      'phone_number': requestData.phoneNumber,
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
  String? preferredAuthMethod;
  if (requestData.requiredAuthMethods != null) {
    if (requestData.requiredAuthMethods!.contains(AuthMethodKind.phone)) {
      preferredAuthMethod = "sms";
    } else if (requestData.requiredAuthMethods!
        .contains(AuthMethodKind.email)) {
      preferredAuthMethod = "email";
    }
  }

  final headers = {
    'Content-Type': 'application/json',
    'X-Onboarding-Config-Key': requestData.obConfig,
    'X-Fp-Is-Components-Sdk': 'true'
  };
  if (requestData.sandboxId != null) {
    headers['X-Sandbox-Id'] = requestData.sandboxId!;
  }

  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/identify/signup_challenge'),
    headers: headers,
    body: jsonEncode({
      'challenge_kind': preferredAuthMethod,
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
  final identifyResponse = await identify((
    email: requestData.email,
    phoneNumber: requestData.phoneNumber,
    obConfig: requestData.obConfig,
    sandboxId: requestData.sandboxId,
    authToken: requestData.authToken,
  ));
  if (identifyResponse.user?.authMethods != null) {
    final hasVerifiedSource =
        identifyResponse.user!.authMethods.any((e) => e.isVerified);
    if (!hasVerifiedSource) {
      throw InlineOtpNotSupportedException("No verified source found");
    }
    final hasPhone = identifyResponse.user!.authMethods.any(
      (e) => e.kind == AuthMethodKind.phone && e.isVerified,
    );
    final hasEmail = identifyResponse.user!.authMethods.any(
      (e) => e.kind == AuthMethodKind.email && e.isVerified,
    );
    if (requestData.requiredAuthMethods != null) {
      if (requestData.requiredAuthMethods!.contains(AuthMethodKind.phone) &&
          !hasPhone) {
        throw InlineOtpNotSupportedException(
            "Inline OTP not supported - phone number is required but has not been verified");
      }
      if (requestData.requiredAuthMethods!.contains(AuthMethodKind.email) &&
          !hasEmail) {
        throw InlineOtpNotSupportedException(
            "Inline OTP not supported - email is required but has not been verified");
      }
    }
    if (hasPhone) {
      final loginChallengeResponse =
          await loginChallenge(token: identifyResponse.user!.token);
      return loginChallengeResponse;
    } else if (hasEmail) {
      final loginChallengeResponse = await loginChallenge(
          kind: "email", token: identifyResponse.user!.token);
      return loginChallengeResponse;
    } else {
      throw InlineOtpNotSupportedException("No supported auth method found");
    }
  }
  final signupChallengeResponse = await signupChallenge(requestData);
  return signupChallengeResponse;
}
