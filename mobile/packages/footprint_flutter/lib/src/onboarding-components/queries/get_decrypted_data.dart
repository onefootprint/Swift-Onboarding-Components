import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:http/http.dart' as http;

typedef GetDecryptedDataRequest = ({
  String authToken,
  List<DataIdentifier> dis,
});

Future<Map<String, dynamic>> getDecryptedUserData(
    String authToken, List<String> dis) async {
  final data = {
    "fields": dis,
  };

  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/user/vault/decrypt'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': authToken
    },
    body: jsonEncode(data),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return responseBody;
  } else {
    throw Exception('Failed to get decrypted user data');
  }
}

Future<Map<String, dynamic>> getDecryptedBusinessData(
    String authToken, List<String> dis) async {
  final data = {
    "fields": dis,
  };

  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/business/vault/decrypt'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': authToken
    },
    body: jsonEncode(data),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return responseBody;
  } else {
    throw Exception('Failed to get decrypted business data');
  }
}

Future<FormData> getDecryptedData(GetDecryptedDataRequest requestData) async {
  final (:authToken, :dis) = requestData;

  // We can't decrypt these fields for now
  // they will require a step up, which we don't support yet
  final filteredDis = dis
      .where(
        (di) =>
            di != DataIdentifier.idSsn4 &&
            di != DataIdentifier.idSsn9 &&
            di != DataIdentifier.idUsTaxId &&
            di != DataIdentifier.businessTin,
      )
      .toList();

  // get the string representation of the data identifiers
  final stringDis = filteredDis.map((di) => di.value).toList();

  // check if any of the strings start with 'business.'
  final hasBusiness = stringDis.any((di) => di.startsWith('business.'));
  final hasUser = stringDis.any((di) => di.startsWith('id.'));

  Map<String, dynamic> userData =
      hasUser ? await getDecryptedUserData(authToken, stringDis) : {};
  Map<String, dynamic> businessData =
      hasBusiness ? await getDecryptedBusinessData(authToken, stringDis) : {};

  // merge the two maps - for conflicting keys, non-null values will take precedence, if both are non-null, the user data will take precedence
  final mergedData = {...businessData};
  userData.forEach((key, value) {
    if (!mergedData.containsKey(key)) {
      mergedData[key] = value;
    } else if (value != null) {
      mergedData[key] = value;
    }
  });

  final formData = FormData.fromJson(mergedData);
  return formData;
}
