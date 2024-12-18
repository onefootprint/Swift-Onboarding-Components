import 'package:footprint_flutter/src/models/l10n.dart';

const int DOB_MIN_AGE = 18;
const int DOB_MAX_AGE = 12000;

bool isEmail(String value) {
  final emailRegex = RegExp(
    r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    caseSensitive: false,
  );

  return emailRegex.hasMatch(value);
}

bool isPhoneNumber(String value) {
  final phoneNumberRegex = RegExp(
    r'^\+?[1-9]\d{1,14}$', // E.164 format, which includes optional leading '+' and numbers only
    caseSensitive: false,
  );

  return phoneNumberRegex.hasMatch(value);
}

bool isValidDate(String date) {
  try {
    DateTime.parse(date);
    return true;
  } catch (e) {
    return false;
  }
}

bool isDobTooYoung(String date, {DateTime? today}) {
  today ??= DateTime.now();
  DateTime dob = DateTime.parse(date);
  int age = today.year - dob.year;
  if (today.month < dob.month ||
      (today.month == dob.month && today.day < dob.day)) {
    age--;
  }
  return age < DOB_MIN_AGE;
}

bool isDobTooOld(String date, {DateTime? today}) {
  today ??= DateTime.now();
  DateTime dob = DateTime.parse(date);
  int age = today.year - dob.year;
  if (today.month < dob.month ||
      (today.month == dob.month && today.day < dob.day)) {
    age--;
  }
  return age > DOB_MAX_AGE;
}

bool isDobInTheFuture(String date, {DateTime? today}) {
  today ??= DateTime.now();
  DateTime dob = DateTime.parse(date);
  return dob.isAfter(today);
}

Map<String, String> getMonthYearDateString(String date,
    {FootprintSupportedLocale? locale}) {
  final dayIndex = locale == FootprintSupportedLocale.enUS ? 1 : 0;
  final monthIndex = locale == FootprintSupportedLocale.enUS ? 0 : 1;
  const yearIndex = 2;

  List<String> dateArray = date.split('/');
  if (dateArray.length != 3 ||
      dayIndex < 0 ||
      monthIndex < 0 ||
      yearIndex < 0) {
    return {'day': '', 'month': '', 'year': ''};
  }
  String day = dateArray[dayIndex];
  String month = dateArray[monthIndex];
  String year = dateArray[yearIndex];
  return {'day': day, 'month': month, 'year': year};
}

bool validateFormat(Map<String, String> dateComponents) {
  final dayString = dateComponents['day'];
  final dayNumber = int.tryParse(dayString!);
  if (dayNumber == null ||
      dayNumber < 1 ||
      dayNumber > 31 ||
      dayString.length != 2) {
    return false;
  }

  final monthString = dateComponents['month'];
  final monthNumber = int.tryParse(monthString!);
  if (monthNumber == null ||
      monthNumber < 1 ||
      monthNumber > 12 ||
      monthString.length != 2) {
    return false;
  }

  final yearString = dateComponents['year'];
  final yearNumber = int.tryParse(yearString!);
  if (yearNumber == null || yearString.length != 4) {
    return false;
  }

  return true;
}

String? validateDob(String dob, {FootprintSupportedLocale? locale}) {
  final dateComponents = getMonthYearDateString(dob, locale: locale);
  final isCorrectFormat = validateFormat(dateComponents);
  final validFormat =
      locale == FootprintSupportedLocale.enUS ? 'MM/DD/YYYY' : 'DD/MM/YYYY';
  if (!isCorrectFormat) {
    return 'Invalid date. Please use $validFormat';
  }

  final dobString =
      '${dateComponents['year']}-${dateComponents['month']}-${dateComponents['day']}';

  if (!isValidDate(dobString)) {
    return 'Invalid date';
  }
  if (isDobInTheFuture(dobString)) {
    return 'Cannot be in the future';
  }
  if (isDobTooYoung(dobString)) {
    return 'Must be at least 18 years old';
  }
  if (isDobTooOld(dobString)) {
    return 'Cannot be before than 1900';
  }
  return null;
}

// 0000 is not allowed, has to be 4 digits long
bool isSsn4(String value) {
  final RegExp patternSsn4 = RegExp(r'^((?!(0000))\d{4})$');
  return patternSsn4.hasMatch(value);
}

// Numbers with all zeros in any digit group (000-##-####, ###-00-####, ###-##-0000) are not allowed.
// Numbers with 666 or 900–999 in the first digit group are not allowed.
// Also validates length & formatting.
bool isSsn9(String value) {
  final RegExp patternSsn9 = RegExp(
    r'^(?!000|666|9\d{2})(\d{3}-(?!00)\d{2}-(?!0000)\d{4})$',
  );
  return patternSsn9.hasMatch(value);
}

bool isName(String value) {
  final String trimmedName = value.trim();
  final RegExp allowedChars = RegExp(r'^([^@#$%^*()_+=~/\\<>~`[\]{}!?;:]+)$');

  return allowedChars.hasMatch(trimmedName);
}

bool isURL(String value) {
  final RegExp pattern = RegExp(
    r'^(?:(https?:\/\/)?(?!-)(?:[A-Za-z0-9-]{1,63}\.)+(?!-)[A-Za-z0-9]{2,}(?::\d{2,5})?)?(?:\/[^\s?#]*)?(?:\?[^\s#]*)?(?:#[^\s]*)?$',
    caseSensitive: false,
  );
  return pattern.hasMatch(value);
}
