part of "../footprint_flutter.dart";

Future<void> _sendSdkTelemetry(String message, String kind) async {
  try {
    var payload = {
      'message': message,
      'sdk_kind': _sdkKind,
      'sdk_name': _sdkName,
      'sdk_version': _sdkVersion,
      'log_level': kind,
    };

    // Fire and forget. No need to await or handle the response.
    await http.post(
      Uri.parse('$_apiBaseUrl/org/sdk_telemetry'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(payload),
    );
  } catch (e) {
    // do nothing
  }
}
