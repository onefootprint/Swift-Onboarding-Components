import 'package:footprint_flutter/src/models/bootstrap_data.dart';
import 'package:footprint_flutter/src/models/internal/configuration.dart';
import 'package:meta/meta.dart';

class FootprintConfiguration extends Configuration {
  final FootprintBootstrapData? bootstrapData;

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
    this.bootstrapData,
  });

  @override
  @internal
  Map<String, dynamic> toJson() {
    var map = {
      'l10n': l10n?.toJson(),
      'options': options?.toJson(),
      'auth_token': authToken,
      'public_key': publicKey,
      'user_data': bootstrapData?.toJson(),
      'appearance': appearance?.toJson(),
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
