import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/models/footprint_error.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/date_formatter.dart';

Map<String, dynamic> removeEmpty(Map<String, dynamic> obj) {
  return obj.entries.fold({}, (acc, e) {
    if (e.value != null && e.value != '') {
      acc[e.key] = e.value;
    }
    return acc;
  });
}

Map<String, dynamic> formatBeforeSave(
    Map<String, dynamic> data, FootprintSupportedLocale locale) {
  if (data['id.dob'] is String) {
    final usDobString = strInputToUSDate(locale, data['id.dob']);
    data['id.dob'] = fromUSDateToISO8601Format(usDobString);
    if (data['id.dob'] == null) {
      throw FootprintError(
        kind: ErrorKind.vaultingError,
        message: "Invalid date format. Error in formatting date.",
      );
    }
  }

  if (data["id.visa_expiration_date"] is String) {
    final usVisaExpirationDateString =
        strInputToUSDate(locale, data["id.visa_expiration_date"]);
    data["id.visa_expiration_date"] =
        fromUSDateToISO8601Format(usVisaExpirationDateString);
    if (data["id.visa_expiration_date"] == null) {
      throw FootprintError(
        kind: ErrorKind.vaultingError,
        message:
            "Invalid date format. Error in formatting visa expiration date.",
      );
    }
  }

  if (data["business.formation_date"] is String) {
    final usFormationDateString =
        strInputToUSDate(locale, data["business.formation_date"]);
    data["business.formation_date"] =
        fromUSDateToISO8601Format(usFormationDateString);
    if (data["business.formation_date"] == null) {
      throw FootprintError(
        kind: ErrorKind.vaultingError,
        message: "Invalid date format. Error in formatting formation date.",
      );
    }
  }

  return removeEmpty(data);
}
