import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:meta/meta.dart';
import 'package:http/http.dart' as http;

@internal
Future<void> sendSdkTelemetry(String message, String kind) async {
  try {
    await http.post(
      Uri.parse('$apiBaseUrl/org/sdk_telemetry'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'message': message,
        'sdk_kind': sdkKind,
        'sdk_name': sdkName,
        'sdk_version': sdkVersion,
        'log_level': kind,
      }),
    );
  } catch (e) {
    // do nothing
  }
}
