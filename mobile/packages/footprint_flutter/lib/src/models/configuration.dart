import 'package:footprint_flutter/src/models/appearance.dart';
import 'package:footprint_flutter/src/models/bootstrap_data.dart';
import 'package:footprint_flutter/src/models/l10n.dart';
import 'package:footprint_flutter/src/models/options.dart';
import 'package:meta/meta.dart';

class FootprintConfiguration {
  final FootprintAppearance? appearance;
  final FootprintL10n? l10n;
  final FootprintOptions? options;
  final FootprintBootstrapData? bootstrapData;
  final Function(String)? onComplete;
  final Function({required String authToken, required String vaultingToken})?
      onAuthComplete;
  final Function(Object)? onError;
  final String? authToken;
  final String? publicKey;
  final String redirectUrl;
  final void Function()? onCancel;

  FootprintConfiguration({
    this.appearance,
    this.authToken,
    this.l10n,
    this.onCancel,
    this.onComplete,
    this.onAuthComplete,
    this.onError,
    this.options,
    this.publicKey,
    required this.redirectUrl,
    this.bootstrapData,
  });

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
