import 'dart:convert';

import 'package:footprint_flutter/src/config/constants.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/data_identifier.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_error.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/date_formatter.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/parse_api_error_response.dart';
import 'package:http/http.dart' as http;

typedef GetDecryptedDataRequest = ({
  String authToken,
  List<DataIdentifier> dis,
  FootprintSupportedLocale locale,
});

Map<String, dynamic> formatDecryptedData(
    Map<String, dynamic> data, FootprintSupportedLocale locale) {
  if (data['id.dob'] is String) {
    final usDobString = fromISO8601ToUSDate(data['id.dob']);
    data['id.dob'] = fromUsDateToStringInput(locale, usDobString ?? '');
    if (data['id.dob'] == null || data['id.dob'] == '') {
      throw FootprintError(
        kind: ErrorKind.decryptionError,
        message: 'Invalid date format. Error in formatting date.',
      );
    }
  }

  if (data["id.visa_expiration_date"] is String) {
    final usVisaExpirationDateString =
        fromISO8601ToUSDate(data["id.visa_expiration_date"]);
    data["id.visa_expiration_date"] =
        fromUsDateToStringInput(locale, usVisaExpirationDateString ?? '');
    if (data["id.visa_expiration_date"] == null ||
        data["id.visa_expiration_date"] == '') {
      throw FootprintError(
        kind: ErrorKind.decryptionError,
        message:
            'Invalid date format. Error in formatting visa expiration date.',
      );
    }
  }

  if (data["business.formation_date"] is String) {
    final usFormationDateString =
        fromISO8601ToUSDate(data["business.formation_date"]);
    data["business.formation_date"] =
        fromUsDateToStringInput(locale, usFormationDateString ?? '');
    if (data["business.formation_date"] == null ||
        data["business.formation_date"] == '') {
      throw FootprintError(
        kind: ErrorKind.decryptionError,
        message: 'Invalid date format. Error in formatting formation date.',
      );
    }
  }

  return data;
}

Future<Map<String, dynamic>> getDecryptedUserData(
    String authToken, List<String> dis) async {
  final data = {
    "fields": dis,
  };

  final response = await http.post(
    Uri.parse('$apiBaseUrl/hosted/user/vault/decrypt'),
    headers: {
      'Content-Type': 'application/json',
      'X-Fp-Authorization': authToken,
      'x-fp-client-version': clientVersion
    },
    body: jsonEncode(data),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return responseBody;
  } else {
    final parsedError = parseApiErrorResponse(response.body);
    throw FootprintError(
      kind: ErrorKind.decryptionError,
      message: 'Failed to get decrypted user data',
      supportId: parsedError.supportId,
    );
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
      'X-Fp-Authorization': authToken,
      'x-fp-client-version': clientVersion
    },
    body: jsonEncode(data),
  );

  if (response.statusCode == 200) {
    final responseBody = jsonDecode(response.body);
    return responseBody;
  } else {
    final parsedError = parseApiErrorResponse(response.body);
    throw FootprintError(
      kind: ErrorKind.decryptionError,
      message: 'Failed to get decrypted business data',
      supportId: parsedError.supportId,
    );
  }
}

Future<FormData> getDecryptedData(GetDecryptedDataRequest requestData) async {
  final (:authToken, :dis, :locale) = requestData;

  // We can't decrypt these fields for now
  // they will require a step up, which we don't support yet
  final filteredDis = dis
      .where(
        (di) =>
            di != DataIdentifier.idSsn4 &&
            di != DataIdentifier.idSsn9 &&
            di != DataIdentifier.idUsTaxId,
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
  final formattedData = formatDecryptedData(mergedData, locale);

  final formData = FormData.fromJson(formattedData);
  return formData;
}
