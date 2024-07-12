part of "../footprint_flutter.dart";

class FootprintConfiguration {
  final FootprintAppearance? appearance;
  final FootprintL10n? l10n;
  final FootprintOptions? options;
  final FootprintBootstrapData? bootstrapData;
  final Function(String)? onComplete;
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
    this.options,
    this.publicKey,
    required this.redirectUrl,
    this.bootstrapData,
  });

  Map<String, dynamic> _toJson() {
    var map = {
      'l10n': l10n?._toJson(),
      'options': options?._toJson(),
      'auth_token': authToken,
      'public_key': publicKey,
      'user_data': bootstrapData?._toJson(),
      'appearance': appearance?._toJson(),
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
