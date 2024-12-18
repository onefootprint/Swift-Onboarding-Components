import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_error.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/parse_api_error_response.dart';
import 'package:http/http.dart' as http;

Future<void> process(String authToken) async {
  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/onboarding/process'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': authToken,
      'x-fp-client-version': clientVersion
    },
  );

  if (response.statusCode != 200) {
    final parsedError = parseApiErrorResponse(response.body);
    throw FootprintError(
      kind: ErrorKind.onboardingError,
      message:
          'Failed to process onboarding. ${jsonDecode(response.body)['message']}',
      supportId: parsedError.supportId,
    );
  }
}
