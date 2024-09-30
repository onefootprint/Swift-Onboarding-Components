import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
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
    throw Exception(
        'Failed to process onboarding. ${jsonDecode(response.body)['message']}');
  }
}
