import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/onboarding-components/utils/date_formatter.dart';

Map<String, dynamic> removeEmpty(Map<String, dynamic> obj) {
  return obj.entries.fold({}, (acc, e) {
    if (e.value != null) {
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
      throw Exception('Invalid date format. Error in formatting date.');
    }
  }
  return removeEmpty(data);
}
