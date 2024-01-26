import 'dart:convert';
import '../types/footprint_types.dart';

String createUrl({
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
    var variables = encode(appearance.variables?.toJson());
    var rules = encode(appearance.rules?.toJson());

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

String encode(Map<String, dynamic>? obj) {
  return obj != null && obj.isNotEmpty
      ? Uri.encodeComponent(json.encode(obj))
      : '';
}
