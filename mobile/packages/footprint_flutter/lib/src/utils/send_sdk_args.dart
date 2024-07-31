import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/models/configuration.dart';
import 'package:http/http.dart' as http;

class SdkArgsResponse {
  final String? data;
  final String? error;

  SdkArgsResponse({this.data, this.error});

  bool get failed => data == null;
}

Future<SdkArgsResponse> _sendSdkArgsRecursive(
    Map<String, dynamic> payload, int numRetries) async {
  try {
    var response = await http.post(
      Uri.parse('$apiBaseUrl/org/sdk_args'),
      headers: {
        'x-fp-client-version': '$sdkName $sdkVersion',
        'Content-Type': 'application/json'
      },
      body: jsonEncode(payload),
    );

    if (response.statusCode == 200) {
      var data = jsonDecode(response.body);
      return SdkArgsResponse(data: data['token']);
    } else {
      throw Exception('Failed to fetch token');
    }
  } catch (e) {
    if (numRetries > 0) {
      return _sendSdkArgsRecursive(payload, numRetries - 1);
    }
    return SdkArgsResponse(error: e.toString());
  }
}

Future<SdkArgsResponse> sendSdkArgs(FootprintConfiguration data) async {
  return await _sendSdkArgsRecursive({
    'kind': sdkKind,
    'data': data.toJson(),
  }, numRetries);
}
