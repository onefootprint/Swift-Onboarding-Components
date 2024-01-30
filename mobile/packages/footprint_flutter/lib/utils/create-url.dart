part of "../footprint_flutter.dart";

String _createUrl({
  FootprintAppearance? appearance,
  FootprintL10n? l10n,
  String? redirectUrl,
  required String token,
}) {
  var searchParams = StringBuffer();

  void addParam(String key, String value) {
    if (searchParams.isNotEmpty) {
      searchParams.write('&');
    }
    searchParams.write('$key=$value');
  }

  if (redirectUrl != null) {
    addParam('redirect_url', redirectUrl);
  }

  if (appearance != null) {
    var variables = _encode(appearance.variables?._toJson());
    var rules = _encode(appearance.rules?._toJson());

    if (variables.isNotEmpty) {
      addParam('variables', variables);
    }
    if (rules.isNotEmpty) {
      addParam('rules', rules);
    }
    if (appearance.fontSrc != null) {
      addParam('font_src', appearance.fontSrc!);
    }
  }

  return 'https://id.onefootprint.com?$searchParams#$token';
}

String _encode(Map<String, dynamic>? obj) {
  return obj != null && obj.isNotEmpty
      ? Uri.encodeComponent(json.encode(obj))
      : '';
}
