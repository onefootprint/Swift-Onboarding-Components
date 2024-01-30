part of "../footprint_flutter.dart";

class _SdkArgsResponse {
  final String? data;
  final String? error;

  _SdkArgsResponse({this.data, this.error});

  bool get failed => data == null;
}

Future<_SdkArgsResponse> _sendSdkArgsRecursive(
    Map<String, dynamic> payload, int numRetries) async {
  try {
    var response = await http.post(
      Uri.parse('$_apiBaseUrl/org/sdk_args'),
      headers: {
        'x-fp-client-version': '$_sdkName $_sdkVersion',
        'Content-Type': 'application/json'
      },
      body: jsonEncode(payload),
    );

    if (response.statusCode == 200) {
      var data = jsonDecode(response.body);
      return _SdkArgsResponse(data: data['token']);
    } else {
      throw Exception('Failed to fetch token');
    }
  } catch (e) {
    if (numRetries > 0) {
      return _sendSdkArgsRecursive(payload, numRetries - 1);
    }
    return _SdkArgsResponse(error: e.toString());
  }
}

Future<_SdkArgsResponse> _sendSdkArgs(FootprintConfiguration data) async {
  return await _sendSdkArgsRecursive({
    'kind': _sdkKind,
    'data': data._toJson(),
  }, _numRetries);
}
