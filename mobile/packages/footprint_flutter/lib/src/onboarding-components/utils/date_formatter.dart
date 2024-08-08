import 'package:footprint_flutter/src/models/l10n.dart';

/// Checks if the given [value] is a string.
bool isString(dynamic value) => value is String;

/// Converts a date string to a US date format based on the locale.
///
/// [locale] should be a locale string like 'en_US' or 'es_MX'.
/// [str] is a date string in the format '12/25/1997' or '25/12/1997'.
///
/// Returns a date string in US format 'MM/DD/YYYY'.
String strInputToUSDate(FootprintSupportedLocale locale, String str) {
  if (str.isEmpty || !isString(str) || locale.name.isEmpty) return '';

  final parts = str.trim().split('/');

  final day = parts.isNotEmpty ? parts[0].padLeft(2, '0') : '';
  final month = parts.length > 1 ? parts[1].padLeft(2, '0') : '';
  final year = parts.length > 2 ? parts[2] : '';

  if (day.isEmpty || month.isEmpty || year.isEmpty) return '';

  return locale == FootprintSupportedLocale.enUS
      ? '$day/$month/$year'
      : '$month/$day/$year';
}

/// Converts a US date string to ISO 8601 format.
///
/// [date] is a date string in the format '12/25/1997' or '1/1/1997'.
///
/// Returns a date string in ISO 8601 format 'YYYY-MM-DD' or null if the input is invalid.
String? fromUSDateToISO8601Format(String? date) {
  if (date == null || !isString(date) || date.isEmpty) return null;

  final parts = date.trim().split('/');
  if (parts.length != 3) return null;

  final month = parts[0];
  final day = parts[1];
  final year = parts[2];

  return (day.isNotEmpty && month.isNotEmpty && year.isNotEmpty)
      ? '$year-${month.padLeft(2, '0')}-${day.padLeft(2, '0')}'
      : null;
}
