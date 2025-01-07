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
  final acceptedRegexes = {
    "generic": RegExp(
      r'^\+?[1-9]\d{1,14}$', // E.164 format, which includes optional leading '+' and numbers only
      caseSensitive: false,
    ),
    "am-AM": RegExp(r'^(\+?374|0)(33|4[134]|55|77|88|9[13-689])\d{6}$',
        caseSensitive: false),
    "ar-AE": RegExp(r'^((\+?971)|0)?5[024568]\d{7}$', caseSensitive: false),
    "ar-BH": RegExp(r'^(\+?973)?(3|6)\d{7}$', caseSensitive: false),
    "ar-DZ": RegExp(r'^(\+?213|0)(5|6|7)\d{8}$', caseSensitive: false),
    "ar-LB": RegExp(r'^(\+?961)?((3|81)\d{6}|7\d{7})$', caseSensitive: false),
    "ar-EG": RegExp(r'^((\+?20)|0)?1[0125]\d{8}$', caseSensitive: false),
    "ar-IQ": RegExp(r'^(\+?964|0)?7[0-9]\d{8}$', caseSensitive: false),
    "ar-JO": RegExp(r'^(\+?962|0)?7[789]\d{7}$', caseSensitive: false),
    "ar-KW": RegExp(r'^(\+?965)([569]\d{7}|41\d{6})$', caseSensitive: false),
    "ar-LY": RegExp(r'^((\+?218)|0)?(9[1-6]\d{7}|[1-8]\d{7,9})$',
        caseSensitive: false),
    "ar-MA": RegExp(r'^(?:(?:\+|00)212|0)[5-7]\d{8}$', caseSensitive: false),
    "ar-OM": RegExp(r'^((\+|00)968)?(9[1-9])\d{6}$', caseSensitive: false),
    "ar-PS": RegExp(r'^(\+?970|0)5[6|9](\d{7})$', caseSensitive: false),
    "ar-SA": RegExp(r'^(!?(\+?966)|0)?5\d{8}$', caseSensitive: false),
    "ar-SD":
        RegExp(r'^((\+?249)|0)?(9[012369]|1[012])\d{7}$', caseSensitive: false),
    "ar-SY": RegExp(r'^(!?(\+?963)|0)?9\d{8}$', caseSensitive: false),
    "ar-TN": RegExp(r'^(\+?216)?[2459]\d{7}$', caseSensitive: false),
    "az-AZ":
        RegExp(r'^(\+994|0)(10|5[015]|7[07]|99)\d{7}$', caseSensitive: false),
    "bs-BA": RegExp(r'^((((\+|00)3876)|06))((([0-3]|[5-6])\d{6})|(4\d{7}))$',
        caseSensitive: false),
    "be-BY": RegExp(r'^(\+?375)?(24|25|29|33|44)\d{7}$', caseSensitive: false),
    "bg-BG": RegExp(r'^(\+?359|0)?8[789]\d{7}$', caseSensitive: false),
    "bn-BD": RegExp(r'^(\+?880|0)1[13456789][0-9]{8}$', caseSensitive: false),
    "ca-AD": RegExp(r'^(\+376)?[346]\d{5}$', caseSensitive: false),
    "cs-CZ": RegExp(r'^(\+?420)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$',
        caseSensitive: false),
    "da-DK": RegExp(r'^(\+?45)?\s?\d{2}\s?\d{2}\s?\d{2}\s?\d{2}$',
        caseSensitive: false),
    "de-DE": RegExp(
        r'^((\+49|0)1)(5[0-25-9]\d|6([23]|0\d?)|7([0-57-9]|6\d))\d{7,9}$',
        caseSensitive: false),
    "de-AT": RegExp(r'^(\+43|0)\d{1,4}\d{3,12}$', caseSensitive: false),
    "de-CH": RegExp(r'^(\+41|0)([1-9])\d{1,9}$', caseSensitive: false),
    "de-LU": RegExp(r'^(\+352)?((6\d1)\d{6})$', caseSensitive: false),
    "dv-MV": RegExp(r'^(\+?960)?(7[2-9]|9[1-9])\d{5}$', caseSensitive: false),
    "el-GR": RegExp(r'^(\+?30|0)?6(8[5-9]|9(?![26])[0-9])\d{7}$',
        caseSensitive: false),
    "el-CY": RegExp(r'^(\+?357?)?(9(9|6)\d{6})$', caseSensitive: false),
    "en-AI": RegExp(
        r'^(\+?1|0)264(?:2(35|92)|4(?:6[1-2]|76|97)|5(?:3[6-9]|8[1-4])|7(?:2(4|9)|72))\d{4}$',
        caseSensitive: false),
    "en-AU": RegExp(r'^(\+?61|0)4\d{8}$', caseSensitive: false),
    "en-AG": RegExp(
        r'^(?:\+1|1)268(?:464|7(?:1[3-9]|[28]\d|3[0246]|64|7[0-689]))\d{4}$',
        caseSensitive: false),
    "en-BM": RegExp(
        r'^(\+?1)?441(((3|7)\d{6}$)|(5[0-3][0-9]\d{4}$)|(59\d{5}$))',
        caseSensitive: false),
    "en-BS": RegExp(r'^(\+?1[-\s]?|0)?\(?242\)?[-\s]?\d{3}[-\s]?\d{4}$',
        caseSensitive: false),
    "en-GB": RegExp(r'^(\+?44|0)7[1-9]\d{8}$', caseSensitive: false),
    "en-GG": RegExp(r'^(\+?44|0)1481\d{6}$', caseSensitive: false),
    "en-GH": RegExp(r'^(\+233|0)(20|50|24|54|27|57|26|56|23|28|55|59)\d{7}$',
        caseSensitive: false),
    "en-GY": RegExp(r'^(\+592|0)6\d{6}$', caseSensitive: false),
    "en-HK": RegExp(r'^(\+?852[-\s]?)?[456789]\d{3}[-\s]?\d{4}$',
        caseSensitive: false),
    "en-MO":
        RegExp(r'^(\+?853[-\s]?)?[6]\d{3}[-\s]?\d{4}$', caseSensitive: false),
    "en-IE": RegExp(r'^(\+?353|0)8[356789]\d{7}$', caseSensitive: false),
    "en-IN": RegExp(r'^(\+?91|0)?[6789]\d{9}$', caseSensitive: false),
    "en-JM": RegExp(r'^(\+?876)?\d{7}$', caseSensitive: false),
    "en-KE": RegExp(r'^(\+?254|0)(7|1)\d{8}$', caseSensitive: false),
    "fr-CF":
        RegExp(r'^(\+?236| ?)(70|75|77|72|21|22)\d{6}$', caseSensitive: false),
    "en-SS": RegExp(r'^(\+?211|0)(9[1257])\d{7}$', caseSensitive: false),
    "en-KI": RegExp(r'^((\+686|686)?)?( )?((6|7)(2|3|8)[0-9]{6})$',
        caseSensitive: false),
    "en-KN": RegExp(r'^(?:\+1|1)869(?:46\d|48[89]|55[6-8]|66\d|76[02-7])\d{4}$',
        caseSensitive: false),
    "en-LS":
        RegExp(r'^(\+?266)(22|28|57|58|59|27|52)\d{6}$', caseSensitive: false),
    "en-MT": RegExp(r'^(\+?356|0)?(99|79|77|21|27|22|25)[0-9]{6}$',
        caseSensitive: false),
    "en-MU": RegExp(r'^(\+?230|0)?\d{8}$', caseSensitive: false),
    "en-MW": RegExp(
        r'^(\+?265|0)(((77|88|31|99|98|21)\d{7})|(((111)|1)\d{6})|(32000\d{4}))$',
        caseSensitive: false),
    "en-NA": RegExp(r'^(\+?264|0)(6|8)\d{7}$', caseSensitive: false),
    "en-NG": RegExp(r'^(\+?234|0)?[789]\d{9}$', caseSensitive: false),
    "en-NZ": RegExp(r'^(\+?64|0)[28]\d{7,9}$', caseSensitive: false),
    "en-PG": RegExp(r'^(\+?675|0)?(7\d|8[18])\d{6}$', caseSensitive: false),
    "en-PK": RegExp(r'^((00|\+)?92|0)3[0-6]\d{8}$', caseSensitive: false),
    "en-PH": RegExp(r'^(09|\+639)\d{9}$', caseSensitive: false),
    "en-RW": RegExp(r'^(\+?250|0)?[7]\d{8}$', caseSensitive: false),
    "en-SG": RegExp(r'^(\+65)?[3689]\d{7}$', caseSensitive: false),
    "en-SL": RegExp(r'^(\+?232|0)\d{8}$', caseSensitive: false),
    "en-TZ": RegExp(r'^(\+?255|0)?[67]\d{8}$', caseSensitive: false),
    "en-UG": RegExp(r'^(\+?256|0)?[7]\d{8}$', caseSensitive: false),
    "en-US": RegExp(
        r'^((\+1|1)?( |-)?)?(\([2-9][0-9]{2}\)|[2-9][0-9]{2})( |-)?([2-9][0-9]{2}( |-)?[0-9]{4})$',
        caseSensitive: false),
    "en-ZA": RegExp(r'^(\+?27|0)\d{9}$', caseSensitive: false),
    "en-ZM": RegExp(r'^(\+?26)?09[567]\d{7}$', caseSensitive: false),
    "en-ZW": RegExp(r'^(\+263)[0-9]{9}$', caseSensitive: false),
    "en-BW": RegExp(r'^(\+?267)?(7[1-8]{1})\d{6}$', caseSensitive: false),
    "es-AR": RegExp(r'^\+?549(11|[2368]\d)\d{8}$', caseSensitive: false),
    "es-BO": RegExp(r'^(\+?591)?(6|7)\d{7}$', caseSensitive: false),
    "es-CO": RegExp(r'^(\+?57)?3(0(0|1|2|4|5)|1\d|2[0-4]|5(0|1))\d{7}$',
        caseSensitive: false),
    "es-CL": RegExp(r'^(\+?56|0)[2-9]\d{1}\d{7}$', caseSensitive: false),
    "es-CR": RegExp(r'^(\+506)?[2-8]\d{7}$', caseSensitive: false),
    "es-CU": RegExp(r'^(\+53|0053)?5\d{7}$', caseSensitive: false),
    "es-DO": RegExp(r'^(\+?1)?8[024]9\d{7}$', caseSensitive: false),
    "es-HN": RegExp(r'^(\+?504)?[9|8|3|2]\d{7}$', caseSensitive: false),
    "es-EC": RegExp(r'^(\+?593|0)([2-7]|9[2-9])\d{7}$', caseSensitive: false),
    "es-ES": RegExp(r'^(\+?34)?[6|7]\d{8}$', caseSensitive: false),
    "es-GT": RegExp(r'^(\+?502)?[2|6|7]\d{7}$', caseSensitive: false),
    "es-PE": RegExp(r'^(\+?51)?9\d{8}$', caseSensitive: false),
    "es-MX": RegExp(r'^(\+?52)?(1|01)?\d{10,11}$', caseSensitive: false),
    "es-NI": RegExp(r'^(\+?505)\d{7,8}$', caseSensitive: false),
    "es-PA": RegExp(r'^(\+?507)\d{7,8}$', caseSensitive: false),
    "es-PY": RegExp(r'^(\+?595|0)9[9876]\d{7}$', caseSensitive: false),
    "es-SV": RegExp(r'^(\+?503)?[67]\d{7}$', caseSensitive: false),
    "es-UY": RegExp(r'^(\+598|0)9[1-9][\d]{6}$', caseSensitive: false),
    "es-VE": RegExp(r'^(\+?58)?(2|4)\d{9}$', caseSensitive: false),
    "et-EE": RegExp(r'^(\+?372)?\s?(5|8[1-4])\s?([0-9]\s?){6,7}$',
        caseSensitive: false),
    "fa-IR": RegExp(r'^(\+?98[\-\s]?|0)9[0-39]\d[\-\s]?\d{3}[\-\s]?\d{4}$',
        caseSensitive: false),
    "fi-FI": RegExp(r'^(\+?358|0)\s?(4[0-6]|50)\s?(\d\s?){4,8}$',
        caseSensitive: false),
    "fj-FJ": RegExp(r'^(\+?679)?\s?\d{3}\s?\d{4}$', caseSensitive: false),
    "fo-FO":
        RegExp(r'^(\+?298)?\s?\d{2}\s?\d{2}\s?\d{2}$', caseSensitive: false),
    "fr-BF": RegExp(r'^(\+226|0)[67]\d{7}$', caseSensitive: false),
    "fr-BJ": RegExp(r'^(\+229)\d{8}$', caseSensitive: false),
    "fr-CD": RegExp(r'^(\+?243|0)?(8|9)\d{8}$', caseSensitive: false),
    "fr-CM": RegExp(r'^(\+?237)6[0-9]{8}$', caseSensitive: false),
    "fr-FR": RegExp(r'^(\+?33|0)[67]\d{8}$', caseSensitive: false),
    "fr-GF": RegExp(r'^(\+?594|0|00594)[67]\d{8}$', caseSensitive: false),
    "fr-GP": RegExp(r'^(\+?590|0|00590)[67]\d{8}$', caseSensitive: false),
    "fr-MQ": RegExp(r'^(\+?596|0|00596)[67]\d{8}$', caseSensitive: false),
    "fr-PF": RegExp(r'^(\+?689)?8[789]\d{6}$', caseSensitive: false),
    "fr-RE": RegExp(r'^(\+?262|0|00262)[67]\d{8}$', caseSensitive: false),
    "fr-WF": RegExp(r'^(\+681)?\d{6}$', caseSensitive: false),
    "he-IL": RegExp(r'^(\+972|0)([23489]|5[012345689]|77)[1-9]\d{6}$',
        caseSensitive: false),
    "hu-HU": RegExp(r'^(\+?36|06)(20|30|31|50|70)\d{7}$', caseSensitive: false),
    "id-ID": RegExp(
        r'^(\+?62|0)8(1[123456789]|2[1238]|3[1238]|5[12356789]|7[78]|9[56789]|8[123456789])([\s?|\d]{5,11})$',
        caseSensitive: false),
    "ir-IR": RegExp(r'^(\+98|0)?9\d{9}$', caseSensitive: false),
    "it-IT": RegExp(r'^(\+?39)?\s?3\d{2} ?\d{6,7}$', caseSensitive: false),
    "it-SM": RegExp(r'^((\+378)|(0549)|(\+390549)|(\+3780549))?6\d{5,9}$',
        caseSensitive: false),
    "ja-JP": RegExp(r'^(\+81[ \-]?(\(0\))?|0)[6789]0[ \-]?\d{4}[ \-]?\d{4}$',
        caseSensitive: false),
    "ka-GE": RegExp(r'^(\+?995)?(79\d{7}|5\d{8})$', caseSensitive: false),
    "kk-KZ": RegExp(r'^(\+?7|8)?7\d{9}$', caseSensitive: false),
    "kl-GL":
        RegExp(r'^(\+?299)?\s?\d{2}\s?\d{2}\s?\d{2}$', caseSensitive: false),
    "ko-KR": RegExp(
        r'^((\+?82)[ \-]?)?0?1([0|1|6|7|8|9]{1})[ \-]?\d{3,4}[ \-]?\d{4}$',
        caseSensitive: false),
    "ky-KG": RegExp(r'^(\+?7\s?\+?7|0)\s?\d{2}\s?\d{3}\s?\d{4}$',
        caseSensitive: false),
    "lt-LT": RegExp(r'^(\+370|8)\d{8}$', caseSensitive: false),
    "lv-LV": RegExp(r'^(\+?371)2\d{7}$', caseSensitive: false),
    "mg-MG": RegExp(r'^((\+?261|0)(2|3)\d)?\d{7}$', caseSensitive: false),
    "mn-MN": RegExp(r'^(\+|00|011)?976(77|81|88|91|94|95|96|99)\d{6}$',
        caseSensitive: false),
    "my-MM": RegExp(
        r'^(\+?959|09|9)(2[5-7]|3[1-2]|4[0-5]|6[6-9]|7[5-9]|9[6-9])[0-9]{7}$',
        caseSensitive: false),
    "ms-MY": RegExp(
        r'^(\+?60|0)1(([0145](-|\s)?\d{7,8})|([236-9](-|\s)?\d{7}))$',
        caseSensitive: false),
    "mz-MZ": RegExp(r'^(\+?258)?8[234567]\d{7}$', caseSensitive: false),
    "nb-NO": RegExp(r'^(\+?47)?[49]\d{7}$', caseSensitive: false),
    "ne-NP": RegExp(r'^(\+?977)?9[78]\d{8}$', caseSensitive: false),
    "nl-BE": RegExp(r'^(\+?32|0)4\d{8}$', caseSensitive: false),
    "nl-NL": RegExp(r'^(((\+|00)?31\(0\))|((\+|00)?31)|0)6{1}\d{8}$',
        caseSensitive: false),
    "nl-AW":
        RegExp(r'^(\+)?297(56|59|64|73|74|99)\d{5}$', caseSensitive: false),
    "nn-NO": RegExp(r'^(\+?47)?[49]\d{7}$', caseSensitive: false),
    "pl-PL": RegExp(r'^(\+?48)? ?([5-8]\d|45) ?\d{3} ?\d{2} ?\d{2}$',
        caseSensitive: false),
    "pt-BR": RegExp(
        r'^((\+?55\ ?[1-9]{2}\ ?)|(\+?55\ ?\([1-9]{2}\)\ ?)|(0[1-9]{2}\ ?)|(\([1-9]{2}\)\ ?)|([1-9]{2}\ ?))((\d{4}\-?\d{4})|(9[1-9]{1}\d{3}\-?\d{4}))$',
        caseSensitive: false),
    "pt-PT": RegExp(r'^(\+?351)?9[1236]\d{7}$', caseSensitive: false),
    "pt-AO": RegExp(r'^(\+244)\d{9}$', caseSensitive: false),
    "ro-MD": RegExp(r'^(\+?373|0)((6(0|1|2|6|7|8|9))|(7(6|7|8|9)))\d{6}$',
        caseSensitive: false),
    "ro-RO": RegExp(r'^(\+?40|0)\s?7\d{2}(\/|\s|\.|-)?\d{3}(\s|\.|-)?\d{3}$',
        caseSensitive: false),
    "ru-RU": RegExp(r'^(\+?7|8)?9\d{9}$', caseSensitive: false),
    "si-LK": RegExp(r'^(?:0|94|\+94)?(7(0|1|2|4|5|6|7|8)( |-)?)\d{7}$',
        caseSensitive: false),
    "sl-SI": RegExp(
        r'^(\+386\s?|0)(\d{1}\s?\d{3}\s?\d{2}\s?\d{2}|\d{2}\s?\d{3}\s?\d{3})$',
        caseSensitive: false),
    "sk-SK": RegExp(r'^(\+?421)? ?[1-9][0-9]{2} ?[0-9]{3} ?[0-9]{3}$',
        caseSensitive: false),
    "so-SO": RegExp(r'^(\+?252|0)((6[0-9])\d{7}|(7[1-9])\d{7})$',
        caseSensitive: false),
    "sq-AL": RegExp(r'^(\+355|0)6[789]\d{6}$', caseSensitive: false),
    "sr-RS": RegExp(r'^(\+3816|06)[- \d]{5,9}$', caseSensitive: false),
    "sv-SE": RegExp(r'^(\+?46|0)[\s\-]?7[\s\-]?[02369]([\s\-]?\d){7}$',
        caseSensitive: false),
    "tg-TJ": RegExp(r'^(\+?992)?[5][5]\d{7}$', caseSensitive: false),
    "th-TH": RegExp(r'^(\+66|66|0)\d{9}$', caseSensitive: false),
    "tr-TR": RegExp(r'^(\+?90|0)?5\d{9}$', caseSensitive: false),
    "tk-TM": RegExp(r'^(\+993|993|8)\d{8}$', caseSensitive: false),
    "uk-UA": RegExp(r'^(\+?38)?0(50|6[36-8]|7[357]|9[1-9])\d{7}$',
        caseSensitive: false),
    "uz-UZ": RegExp(r'^(\+?998)?(6[125-79]|7[1-69]|88|9\d)\d{7}$',
        caseSensitive: false),
    "vi-VN": RegExp(
        r'^((\+?84)|0)((3([2-9]))|(5([25689]))|(7([0|6-9]))|(8([1-9]))|(9([0-9])))([0-9]{7})$',
        caseSensitive: false),
    "zh-CN": RegExp(r'^((\+|00)86)?(1[3-9]|9[28])\d{9}$', caseSensitive: false),
    "zh-TW": RegExp(r'^(\+?886\-?|0)?9\d{8}$', caseSensitive: false),
    "dz-BT": RegExp(r'^(\+?975|0)?(17|16|77|02)\d{6}$', caseSensitive: false),
    "ar-YE": RegExp(
        r'^(((\+|00)9677|0?7)[0137]\d{7}|((\+|00)967|0)[1-7]\d{6})$',
        caseSensitive: false),
    "ar-EH": RegExp(r'^(\+?212|0)[\s\-]?(5288|5289)[\s\-]?\d{5}$',
        caseSensitive: false),
    "fa-AF": RegExp(r'^(\+93|0)?(2{1}[0-8]{1}|[3-5]{1}[0-4]{1})(\d{7})$',
        caseSensitive: false),
  };

  // Check if the phone number matches any of the accepted regexes
  // TODO: Add check based on locale
  for (final key in acceptedRegexes.keys) {
    if (acceptedRegexes[key]!.hasMatch(value)) {
      return true;
    }
  }

  return false;
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
