import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/models/internal/onboarding_config.dart';
import 'package:http/http.dart' as http;

Future<OnboardingConfig> _getOnboardingConfigRecursive(
    String obConfig, int numRetries) async {
  try {
    var response = await http.get(
      Uri.parse('$apiBaseUrl/hosted/onboarding/config'),
      headers: {'X-Onboarding-Config-Key': obConfig},
    );

    if (response.statusCode == 200) {
      var data = jsonDecode(response.body);
      return OnboardingConfig.fromJson(data);
    } else {
      throw Exception('Failed to fetch onboarding config');
    }
  } catch (e) {
    if (numRetries > 0) {
      return _getOnboardingConfigRecursive(obConfig, numRetries - 1);
    }
    throw Exception('Failed to fetch onboarding config after retries');
  }
}

Future<OnboardingConfig> getOnboardingConfig(String obConfig) async {
  return await _getOnboardingConfigRecursive(obConfig, numRetries);
}
