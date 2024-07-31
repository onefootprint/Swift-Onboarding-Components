import 'package:meta/meta.dart';

enum FootprintSupportedLocale {
  enUS, // represents 'en-US'
  esMX, // represents 'es-MX'
}

enum FootprintSupportedLanguage {
  en, // represents 'en'
  es, // represents 'es'
}

class FootprintL10n {
  final FootprintSupportedLocale? locale;
  final FootprintSupportedLanguage? language;

  FootprintL10n({this.locale, this.language});

  @internal
  Map<String, dynamic> toJson() {
    var map = {
      'locale': locale?.name,
      'language': language?.name,
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
