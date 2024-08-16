import 'package:footprint_flutter/src/models/internal/configuration.dart';
import 'package:footprint_flutter/src/onboarding-components/models/form_data.dart';
import 'package:meta/meta.dart';

class FootprintConfiguration extends Configuration {
  final FormData? formData;

  FootprintConfiguration({
    super.appearance,
    super.authToken,
    super.l10n,
    super.onCancel,
    super.onComplete,
    super.onAuthComplete,
    super.onError,
    super.options,
    super.publicKey,
    required super.redirectUrl,
    this.formData,
  });

  @override
  @internal
  Map<String, dynamic> toJson() {
    var map = {
      'l10n': l10n?.toJson(),
      'options': options?.toJson(),
      'auth_token': authToken,
      'public_key': publicKey,
      'user_data': formData?.toJson(),
      'appearance': appearance?.toJson(),
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
