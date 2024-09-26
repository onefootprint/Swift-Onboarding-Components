import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import "package:footprint_flutter/src/onboarding-components/models/save_data_request.dart";
import 'package:http/http.dart' as http;

typedef DataKind = ({bool hasId, bool hasBusiness});

DataKind getDataKind(Map<String, dynamic> data) {
  final hasId = data.entries.any((entry) => entry.key.startsWith('id.'));
  final hasBusiness =
      data.entries.any((entry) => entry.key.startsWith('business.'));
  return (hasBusiness: hasBusiness, hasId: hasId);
}

Future<SaveDataResponse> save(SaveDataRequest payload) async {
  final data = payload.data;
  if (data.entries.isEmpty) {
    return SaveDataResponse(data: null);
  }

  final dataKind = getDataKind(data);
  if (dataKind.hasId && dataKind.hasBusiness) {
    throw Exception("You can't submit id and business at the same time");
  }

  final url =
      dataKind.hasBusiness ? '/hosted/business/vault' : '/hosted/user/vault';
  var response = await http.patch(
    Uri.parse('$apiBaseUrl$url'),
    headers: {
      AUTH_HEADER: payload.authToken,
      'Content-Type': 'application/json'
    },
    body: jsonEncode(data),
  );

  if (response.statusCode == 200) {
    return SaveDataResponse(data: response.body);
  } else {
    throw Exception('Failed to save data. Error: ${response.body}');
  }
}
