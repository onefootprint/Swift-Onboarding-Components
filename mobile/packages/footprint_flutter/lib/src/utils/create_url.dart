import 'dart:convert';

import 'package:footprint_flutter/src/models/internal/configuration.dart';
import 'package:meta/meta.dart';

@internal
String createUrl({
  required String baseUrl,
  Configuration? config,
  String? redirectUrl,
  required String token,
}) {
  final l10n = config?.l10n;
  final appearance = config?.appearance;
  final redirectUrl = config?.redirectUrl;
  final searchParams = StringBuffer();

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
    var variables = _encode(appearance.variables?.toJson());
    var rules = _encode(appearance.rules?.toJson());

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
  if (l10n != null) {
    if (l10n.language != null) {
      addParam('lng', l10n.language!.name);
    }
  }

  return '$baseUrl?$searchParams#$token';
}

String _encode(Map<String, dynamic>? obj) {
  return obj != null && obj.isNotEmpty
      ? Uri.encodeComponent(json.encode(obj))
      : '';
}
