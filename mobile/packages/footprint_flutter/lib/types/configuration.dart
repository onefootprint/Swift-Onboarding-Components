part of "../footprint_flutter.dart";

class FootprintConfiguration {
  final FootprintL10n? l10n;
  final FootprintOptions? options;
  final FootprintUserData? userData;
  final Function(String)? onComplete;
  final String? authToken;
  final String? publicKey;
  final void Function()? onCancel;
  final FootprintAppearance? appearance;

  FootprintConfiguration({
    this.authToken,
    this.l10n,
    this.onCancel,
    this.onComplete,
    this.options,
    this.publicKey,
    this.userData,
    this.appearance,
  });

  Map<String, dynamic> _toJson() {
    var map = {
      'l10n': l10n?._toJson(),
      'options': options?._toJson(),
      'public_key': publicKey,
      'user_data': userData?._toJson(),
      'appearance': appearance?._toJson(),
    };
    map.removeWhere((key, value) => value == null);
    return map;
  }
}
