import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_error.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/parse_api_error_response.dart';
import 'package:http/http.dart' as http;

Future<OnboardingConfig> _getOnboardingConfigRecursive(
    String obConfig, int numRetries) async {
  try {
    var response = await http.get(
      Uri.parse('$apiBaseUrl/hosted/onboarding/config'),
      headers: {
        'X-Onboarding-Config-Key': obConfig,
        'x-fp-client-version': clientVersion,
      },
    );

    if (response.statusCode == 200) {
      var data = jsonDecode(response.body);
      return OnboardingConfig.fromJson(data);
    } else {
      final parsedError = parseApiErrorResponse(response.body);
      throw FootprintError(
        kind: ErrorKind.initializationError,
        message: 'Failed to fetch onboarding config',
        supportId: parsedError.supportId,
      );
    }
  } catch (e) {
    if (numRetries > 0) {
      return _getOnboardingConfigRecursive(obConfig, numRetries - 1);
    }
    throw FootprintError(
      kind: ErrorKind.initializationError,
      message: 'Failed to fetch onboarding config after retries',
    );
  }
}

Future<OnboardingConfig> getOnboardingConfig(String obConfig) async {
  return await _getOnboardingConfigRecursive(obConfig, numRetries);
}
