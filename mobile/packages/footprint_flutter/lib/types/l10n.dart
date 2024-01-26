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

  Map<String, dynamic> toJson() {
    return {
      'locale': locale?.name,
      'language': language?.name,
    };
  }
}
