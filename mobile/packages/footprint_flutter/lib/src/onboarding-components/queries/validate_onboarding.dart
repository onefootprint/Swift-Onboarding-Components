import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/onboarding-components/models/verification_response.dart';
import 'package:http/http.dart' as http;

Future<ValidationTokenResponse> validateOnboarding(String token) async {
  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/onboarding/validate'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': token,
      'x-fp-client-version': clientVersion,
    },
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    final vTok = ValidationTokenResponse.fromJson(responseBody);
    return vTok;
  } else {
    throw Exception('Failed to validate onboarding');
  }
}
