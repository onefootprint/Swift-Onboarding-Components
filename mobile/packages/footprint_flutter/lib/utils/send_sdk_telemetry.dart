part of "../footprint_flutter.dart";

Future<void> _sendSdkTelemetry(String message, String kind) async {
  try {
    await http.post(
      Uri.parse('$_apiBaseUrl/org/sdk_telemetry'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'message': message,
        'sdk_kind': _sdkKind,
        'sdk_name': _sdkName,
        'sdk_version': _sdkVersion,
        'log_level': kind,
      }),
    );
  } catch (e) {
    // do nothing
  }
}
